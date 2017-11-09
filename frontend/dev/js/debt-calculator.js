var debtCalculator = {};

// way to sort any objects that have an amount
var sortAmounts = function(first, second) {
  return second.amount - first.amount; // descending
}

// STEP 1 - exported for testing
// 'items' is a list of Item objects as received from our API, like so:
// {_id: "00", label: "MyItem", assigned_to: {_id: "01", name: "User1"}, cost: 23.95}
debtCalculator.sumExpensesByUserId = function(items) {
  // find out what total sum was
  var totalSum = 0;
  var payers = {}; // key = user's ID, value = "bucket" to collect all of user's costs

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    // may include unassigned items - just skip those, but include cost in total sum
    totalSum += (item.cost ? item.cost : 0);
    if (!item.assigned_to) {
      continue;
    }
    var payer = payers[item.assigned_to._id]; // find responsible user in our current payers record
    if (!payer) { // if the user is not yet in the record, create new
      payers[item.assigned_to._id] = {
        user: item.assigned_to,
        expense: 0
      };
      payer = payers[item.assigned_to._id];
    }
    // if item has a cost assigned, add it to current sum, otherwise add 0
    payer.expense += (item.cost ? item.cost : 0);
  }
  return {
    totalExpenses: totalSum,
    expensesById: payers
  }
};

// STEP 2 - exported for testing
debtCalculator.splitIntoGiversAndReceivers = function(payersById, totalSum) {
  var ids = Object.keys(payersById);
  // divide total cost into number of persons & round to two decimals
  var splittedAmount = Math.round( (totalSum/ids.length) * 100 )/100;

  var givers = [];
  var receivers = [];

  for (var i = 0; i < ids.length; i++) {
    // find out how much user has to pay additionally or is going to be paid back
    var amount = payersById[ids[i]].expense - splittedAmount;
    amount = Math.round(amount * 100)/100;

    if (amount < 0) {
      // user still has debt
      givers.push({
        user: payersById[ids[i]].user,
        amount: -amount
      });
    } else if (amount > 0) {
      // user is getting money back
      receivers.push({
        user: payersById[ids[i]].user,
        amount: amount
      });
    } else {
      // do nothing, user has paid exactly enough
    }
  }

  // return both lists sorted with highest amount first
  return {
    givers: givers.sort(sortAmounts),
    receivers: receivers.sort(sortAmounts)
  };
};

// STEP 3 - exported for testing
debtCalculator.getDebtlist = function(givers, receivers, debtlist) {
  // givers & receivers are sorted arrays, structured like so:
  // [{user: {UserObject}, amount: 10.5}, {user: {UserObject}, amount: 10.5}]
  // debtlist is initially an empty array, recursively being filled like so:
  // [{giver: {UserObject}, receiver: {UserObject}, amount: 10.2},
  //  {giver: {UserObject}, receiver: {UserObject}, amount: 2.6}]

  if (!givers || !receivers) {
    // cannot work on missing data
    return {};
  }

  if (givers.length == 0 && receivers.length == 0) {
    // simplest recursion case AKA we've reached the end
    return {
      even: true,
      debtlist: debtlist
    };
  }

  if (givers.length == 0 || receivers.length == 0) {
    // one of both lists is empty, but not both, means:
    // we've also reached the end, but amount is not evenly divisible
    var leftover = (givers[0] ? givers[0] : receivers[0]);
    leftover["type"] = (givers[0] ? "giver" : "receiver");
    return {
      even: false,
      leftover: leftover,
      debtlist: debtlist
    };
  }

  var diff = givers[0].amount - receivers[0].amount;
  var debt = {
    giver: givers[0].user,
    receiver: receivers[0].user,
  };

  if (diff < 0) {
    // giver[0] gives all to receiver[0], is out
    debt.amount = givers[0].amount;
    givers.splice(0, 1);
    receivers[0].amount = -(Math.round(diff*100)/100);
    receivers.sort(sortAmounts);
  } else if (diff > 0) {
    // giver[0] gives part to receiver[0], receiver is out
    debt.amount = receivers[0].amount;
    receivers.splice(0, 1);
    givers[0].amount = Math.round(diff*100)/100;
    givers.sort(sortAmounts);
  } else {
    // both are out
    debt.amount = receivers[0].amount;
    receivers.splice(0, 1);
    givers.splice(0, 1);
    receivers.sort(sortAmounts);
    givers.sort(sortAmounts);
  }
  debtlist.push(debt);

  return debtCalculator.getDebtlist(givers, receivers, debtlist); // Recuuuursiiioooon
};

// THE WHOLE THING - only function that should be called from outside
debtCalculator.transformIntoDebtlist = function(items, participants) {

  // STEP 1
  // Find out which user paid how much altogether. The only users we know are the ones
  // present in the item list. This means, that if a participant has not paid for anything,
  // more precisely, if he's not at least assigned an item with cost=0, the algorithm
  // ignores him/her. Therefore, we need to pass a list of all event participants as well.
  var sums = debtCalculator.sumExpensesByUserId(items);
  var payersById = sums.expensesById;
  var totalSum = sums.totalExpenses;

  // This function may be called without the extra participant list, though
  if (participants) {
    var payerIds = Object.keys(payersById);
    for (var i = 0; i < participants.length; i++) {
      var id;
      if (typeof participants[i] === 'string') {
        // is id already
        id = participants[i];
      } else {
        // assuming User object
        id = participants[i]._id;
      }
      if (!payerIds.includes(id)) {
        payersById[id] = {
          user: participants[i],
          expense: 0
        }
      }
    }
  }

  // STEP 2
  // Find out how much everyone is SUPPOSED to pay and define, whether they
  // get back money from the others (receivers) or have to pay an additional
  // amount (givers).
  var givsAndRecs = debtCalculator.splitIntoGiversAndReceivers(payersById, totalSum);

  // STEP 3
  // Algorithm: ACTION! Now magically find out who needs to give money to whom.
  var debtlist = debtCalculator.getDebtlist(givsAndRecs.givers, givsAndRecs.receivers, []);

  // Before we return the result, let's include how much it was altogether.
  debtlist["total"] = totalSum;
  return debtlist;
};

// for testing
if (typeof module !== 'undefined') {
  module.exports = debtCalculator;
}
