-- WARNING - THIS WILL RESTART THE DB - ONLY USE IF YOU DON'T NEED DATA TO BE PERSISTENT
-- DROP DATABASE IF EXISTS bamazon;


CREATE database bamazon;
USE bamazon;

CREATE table products (
	id integer(10) auto_increment not null,
    product_name varchar(100) not null, 
    department_name varchar(100) not null,
    price float(10,2) not null,
    stock_quantity integer(10) not null,
    primary key (id)
);
    
insert into products (
	product_name,
    department_name,
    price,
    stock_quantity
) values ("Dog Collar","Pet Care", 19.95, 17);

insert into products (
	product_name,
    department_name,
    price,
    stock_quantity
) values ("King Matress","Bedroom", 350, 15);
