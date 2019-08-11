const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

let productArr;

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    // createProduct();

    readProducts();

    init();
});

function init() {
    inquirer
        .prompt([
            {
                name: "role",
                type: "list",
                choices: ["Customer", "Manager", "Supervisor"],
                message: "Welcome! WHat is your role?"
            }
        ])
        .then(ans => {
            console.log(ans);
            let role = ans.role;

            if (role === "Customer") {
                console.log(`\n
                         ===============================\n
                         Thank you for choosing BAMAZON!\n
                         =============================== `);
                console.log(`\n
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n
                         Take a look at our merchandise.\n
                         =============================== 
                         |PRODUCT ID|  |PRODUCT NAME| |PRICE|`);
                let idList = [];
                productArr.forEach(product => {
                    console.log(`
                            |${product.id}|--|${product.product_name}|--|${
                        product.price
                    }|`);
                    idList.push(product.id);
                });
                inquirer
                    .prompt([
                        {
                            name: "shoppingCart",
                            type: "checkbox",
                            choices: idList,
                            message: "What Would you like to buy? (See above)"
                        }
                    ])
                    .then(ans => {
                        let shoppingCart = [];
                        ans.shoppingCart.forEach(productID => {
                            let j = 0;
                            for (let i = 1; i <= productArr.length; i++) {
                                if (i === productID) {
                                    shoppingCart.push(productArr[i - 1]);
                                }
                            }
                        });
                        shoppingCart.forEach(cartItem => {
                            cartItem.cost = 0;
                        });
                        calcPurchaseQuantity(
                            shoppingCart,
                            shoppingCart.length,
                            0
                        );
                    });
            } else if (role === "Manager") {
                console.log(`\n
              ===============================\n
              Welcome Back BAMAZON Manager!\n
              =============================== `);

                managerPortal();
            }
        });
}

function managerPortal() {
    inquirer
        .prompt([
            {
                name: "option",
                type: "list",
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Restock Inventory",
                    "Add New Product"
                ],
                message: "What Would You Like To Do?"
            }
        ])
        .then(ans => {
            console.log(ans.option);

            if (ans.option === "View Products for Sale") {
                console.log(`\n
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n
                  CURRENT INVENTORY:\n
                  =============================== 
                  |PRODUCT ID|  |PRODUCT NAME| |PRICE| |INVENTORY|`);
                productArr.forEach(product => {
                    console.log(`
                      |${product.id}|--|${product.product_name}|--|${product.price}|--|${product.stock_quantity}|`);
                });
                checkForExtraQuery();
            } else if (ans.option === "View Low Inventory") {
                readLowInventory();
            } else if (ans.option === "Restock Inventory") {
                restockInventory();
            } else {
              addNewProduct();
            }
        });
}

function checkForExtraQuery() {
  inquirer.prompt([
    {
      type: "list",
      name: "again",
      choices: ["Yes","No"],
      message: "Do You Have Another Task To Complete?"
    }
  ]).then(ans => {
    console.log(ans.again);

    if (ans.again === "Yes") {
      managerPortal();
    } else {
      console.log("HAVE A GREAT DAY!");
      connection.end();
    }
  });
}

function addNewProduct() {
  inquirer.prompt([
    {
      type: "input",
      name: "productName",
      message: "What Product Would you Like To Add?"
    },
    {
      type: "input",
      name: "department",
      message: "What Department Is It In?"
    },
    {
      type: "number",
      name: "price",
      message: "How Much Is This Product"
    },
    {
      type: "number",
      name: "quantity",
      message: "How Many Would You Like To Stock?"
    }
  ]).then(ans => {
    console.log(ans);
    const sql = "INSERT INTO products (product_name, department_name, price, stock_quantity)" + `values ("${ans.productName}", "${ans.department}", "${ans.price}", "${ans.quantity}")`;
    connection.query(sql, (res,err) => {
      if (err) console.log(err);
      console.log("CONTENT HAS BEEN UPDATED!!!!!!");
      readProducts();
      checkForExtraQuery();
    });
  });
}

function calcPurchaseQuantity(item, countdown, i) {
    inquirer
        .prompt([
            {
                type: "number",
                name: "quantity",
                message: `How Many Of The ${
                    item[i].product_name
                } Would You Like TO Purchase? (Only ${
                    item[i].stock_quantity
                } Remain!)`
            }
        ])
        .then(ans => {
            console.log(ans.quantity);
            if (ans.quantity <= item[i].stock_quantity) {
                item[i].stock_quantity -= ans.quantity;
                item[i].cost += item[i].price * ans.quantity;
                console.log(item);
                i++;
                countdown--;
            } else {
                console.log(`
                    _________________________________________________________________
                   | Uh oh! We don't have enough of that! Please order a lower amount|
                   |_________________________________________________________________|`);
            }
            if (countdown > 0) {
                calcPurchaseQuantity(item, countdown, i);
            } else updateInventory(item);
        });
}

function updateInventory(newInventory) {
    let totalcost = 0;
    newInventory.forEach(item => {
        totalcost += item.cost;
        connection.query(
            `UPDATE products SET stock_quantity = ${
                item.stock_quantity
            } WHERE id = ${item.id}`,
            function(err, res) {
                if (err) throw err;
            }
        );
    });
    console.log(`
    ===========================================================================
    YOUR TOTAL COST IS $${totalcost.toFixed(
        2
    )}. THANK YOU FOR CHOOSING BAMAZON!\n`);
    connection.end();
}

function readProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        productArr = res;
    });
}

function readLowInventory() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
    if (err) throw err;
    
    console.log(res);
    console.log(`\n
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n
    LOW INVENTORY ITEMS:\n
    =============================== 
    |PRODUCT ID|  |PRODUCT NAME| |PRICE| |INVENTORY|`);
    res.forEach(product => {
      console.log(`
        |${product.id}|--|${product.product_name}|--|${product.price}|--|${product.stock_quantity}|`);
    });
    checkForExtraQuery();
  });
}

function readProdByID(res) {
  const id = res.productID.charAt(0);
  const product = productArr.filter(product => {
    if (product.id === parseInt(id)) {
      return product;
    }
  });
  product[0].stock_quantity += res.quantity
  console.log(product[0]);
  connection.query(
    `UPDATE products SET stock_quantity = ${
        product[0].stock_quantity
    } WHERE id = ${id}`,
    function(err, res) {
        if (err) throw err;
        readProducts();
        console.log(`
          *****INVENTORY HAS BEEN UPDATED*****
        `);
        checkForExtraQuery();
      }
);
}

function restockInventory() {
  let totalProductCount = productArr.length;
  let idList = [];
  for (let i = 1; i <= totalProductCount; i++) {
    idList.push(i + "-" + productArr[i-1].product_name);
  }
  console.log(idList);
  inquirer.prompt([
    {
      type: "list",
      name: "productID",
      choices: idList,
      message: "Which Product Would You Like To Restock?"
    },
    {
      type: "number",
      name: "quantity",
      message: "How Many Products Would You Like to Restock?"
    }
  ]).then(ans => readProdByID(ans));
}
