from datetime import datetime
import uuid
from .index import db

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user') # admin, user, sales
    branch = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Warehouse(db.Model):
    __tablename__ = 'warehouses'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(200), nullable=False)
    sku = db.Column(db.String(50), unique=True)
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'))
    price = db.Column(db.Numeric(10, 2), default=0.00)
    stock_quantity = db.Column(db.Integer, default=0)
    warehouse_id = db.Column(db.String(36), db.ForeignKey('warehouses.id'))

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)
    payment_status = db.Column(db.String(20), default='paid') # paid, pending, partial
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'))

class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    sale_id = db.Column(db.String(36), db.ForeignKey('sales.id'))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(12, 2), nullable=False)

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    contact_person = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))

class Purchase(db.Model):
    __tablename__ = 'purchases'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'))
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50)) # Asset, Liability, Equity, Revenue, Expense
    balance = db.Column(db.Numeric(15, 2), default=0.00)

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    account_id = db.Column(db.String(36), db.ForeignKey('accounts.id'))
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    type = db.Column(db.String(10)) # Debit, Credit
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True)
    phone = db.Column(db.String(20))
    job_title = db.Column(db.String(100))
    salary = db.Column(db.Numeric(12, 2))
    hired_at = db.Column(db.Date)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'))
    date = db.Column(db.Date, default=datetime.utcnow().date)
    status = db.Column(db.String(20)) # Present, Absent, Leave

class PayrollRecord(db.Model):
    __tablename__ = 'payroll_records'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'))
    period_start = db.Column(db.Date)
    period_end = db.Column(db.Date)
    gross_salary = db.Column(db.Numeric(12, 2))
    net_salary = db.Column(db.Numeric(12, 2))
    paid_at = db.Column(db.DateTime)
