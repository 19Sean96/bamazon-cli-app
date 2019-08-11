const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "Tina1mom",
    database: "bamazon"
  });

  let productArr;

  connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    // createProduct();

    readProducts();

    init();
  });

  function init() {

    inquirer.prompt([
        {
            name: "role",
            type: "list",
            choices: [
                "Customer",
                "Manager",
                "Supervisor"
            ],
            message: "Welcome! WHat is your role?"
        }
    ]).then((ans) => {
        console.log(ans);
        let role = ans.role;

        if (role === 'Customer') {

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
                            |${product.id}|--|${product.product_name}|--|${product.price}|`);
                idList.push(product.id);
            });
            inquirer.prompt([
              {
                name: "shoppingCart",
                type: "checkbox",
                choices: idList,
                message: "What Would you like to buy? (See above)"
              }
            ]).then(ans => {
              let shoppingCart =[];
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
              })
              calcPurchaseQuantity(shoppingCart, shoppingCart.length, 0);
            });
            
        }
    });
  }

  function calcPurchaseQuantity(item, countdown, i) {
    let checkoutCart = [];
    inquirer.prompt([
      {
        type: "number",
        name: "quantity",
        message: `How Many Of The ${item[i].product_name} Would You Like TO Purchase? (Only ${item[i].stock_quantity} Remain!)`
      }
    ]).then(ans => {

      console.log(ans.quantity);
      if (ans.quantity <= item[i].stock_quantity) {
        item[i].stock_quantity -= ans.quantity;
        item[i].cost += (item[i].price * ans.quantity);
        console.log(item);
        i++;
        countdown--;
      } else {
        console.log(`
                    _________________________________________________________________
                   | Uh oh! We don't have enough of that! Please order a lower amount|
                   |_________________________________________________________________|`);
      }
      if(countdown > 0) {
        calcPurchaseQuantity(item, countdown, i);
      } else updateInventory(item);
    });
  }

  function updateInventory(newInventory) {
    let totalcost = 0;
    console.log("NEW INVENTORY");
    // console.log(newInventory);
    newInventory.forEach(item => {
      totalcost += item.cost;
      console.log(item, `TOTALCOST: ${totalcost}`);
      connection.query(`UPDATE products SET stock_quantity = ${item.stock_quantity} WHERE id = ${item.id}`, function(err, res) {
        if (err) throw err;
        console.log(`${item.id} UPDATED!`);
      });
    });
    console.log(`YOUR TOTAL COST IS $${totalcost}. THANK YOU FOR CHOOSING BAMAZON!`);
    connection.end();
  }
  
  function readProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      productArr = res;
      // connection.end();
    });
  }