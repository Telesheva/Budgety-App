//BUDGET CONTROLLER
let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function (type, des, val) {
            let newItem, ID;
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create new item based on 'inc' or 'exp' type
            if (type === 'expense') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'income') {
                newItem = new Income(ID, des, val);
            }
            //Push it into our data structure
            data.allItems[type].push(newItem);
            //Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            let index, ids;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            //Calculate total income and expenses
            calculateTotal('expense');
            calculateTotal('income');
            //Calculate the budget: income - expenses
            data.budget = data.totals.income - data.totals.expense;
            //Calculate the percentages of income that we spent
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                percentage: data.percentage
            }
        },

        calculatePercentages: function () {
            data.allItems.expense.forEach(function (cur) {
                cur.calcPercentage(data.totals.income);
            })
        },

        getPercentages: function () {
            let allPerc;
            allPerc = data.allItems.expense.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        testing: function () {
            console.log(data);
        }
    };
})();
//UI CONTROLLER
let UIController = (function () {
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formatNumber = function (num, type) {
        let numSplit, int, dec;
        /*
        + or - before numbers
        exactly 2 decimal points
        comma separating the thousands
        2310.4567 -> + 2310.46
        */
        num = Math.abs(num);
        num = num.toFixed(2); //2 decimal points
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];
        return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;
            //Create HTML string with placeholder text
            if (type === 'income') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> ' +
                    '<div class="item__description">%description%</div> ' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div>' +
                    ' <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> ' +
                    '</div> </div> </div>';
            } else if (type === 'expense') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"> ' +
                    '<div class="item__description">%description%</div> ' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    ' <div class="item__percentage">21%</div> <div class="item__delete"> ' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> ' +
                    '</div> </div> </div>';
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            //we set this variable to the fields, slice method will think that we give it an array
            fieldsArr.forEach(function (cur, i, arr) {
                cur.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'income' : type = 'expense';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'expense');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayDate: function () {
            let now, months, month, year;
          now = new Date();
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December'];
          month = now.getMonth();
          year = now.getFullYear();
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
        },

        changedType: function () {
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            nodeListForEach(fields, function (cur) {
               cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();
//GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {
    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let updateBudget = function () {
        //Calculate the budget
        budgetCtrl.calculateBudget();
        //Return the budget
        let budget = budgetCtrl.getBudget();
        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    let ctrlAddItem = function () {
        let input, newItem;
        //Get the filed input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //Add the item to UI
            UICtrl.addListItem(newItem, input.type);
            //Clear the fields
            UICtrl.clearFields();
            //Calculate and update budget
            updateBudget();
            //Calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-'); //will return smth like ["income", "1"]
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //Delete it from the UI
            UICtrl.deleteListItem(itemID);
            //Update and show the new budget
            updateBudget();
            //Calculate and update percentages
            updatePercentages();
        }
    };

    let updatePercentages = function () {
        //Calculate percentages
        budgetCtrl.calculatePercentages();
        //Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        //Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    return {
        init: function () {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);
controller.init();