from flask import Blueprint, jsonify, request
from models import db, Sale, SaleItem, Product, Customer
from flask_jwt_extended import jwt_required, get_jwt_identity

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_sales():
    sales = Sale.query.all()
    return jsonify([{
        'id': s.id,
        'customer': s.customer.name if s.customer else 'Guest',
        'total_amount': str(s.total_amount),
        'status': s.payment_status,
        'created_at': s.created_at.strftime('%b %d, %Y')
    } for s in sales]), 200

@sales_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    data = request.json
    items = data.get('items', []) # [{'product_id': '...', 'quantity': 1}]
    customer_id = data.get('customer_id')
    user_identity = get_jwt_identity()
    
    total_amount = 0
    sale = Sale(customer_id=customer_id, total_amount=0, payment_status='paid')
    db.session.add(sale)
    
    for item in items:
        product = Product.query.get(item['product_id'])
        if product and product.stock_quantity >= item['quantity']:
            subtotal = product.price * item['quantity']
            total_amount += subtotal
            
            # Create Sale Item
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=item['quantity'],
                unit_price=product.price,
                subtotal=subtotal
            )
            db.session.add(sale_item)
            
            # Update Stock
            product.stock_quantity -= item['quantity']
        else:
            db.session.rollback()
            return jsonify({'message': f'Insufficient stock for {product.name if product else "unknown"}'}), 400
            
    sale.total_amount = total_amount
    db.session.commit()
    
    return jsonify({'message': 'Sale completed successfully', 'id': sale.id}), 201

@sales_bp.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    customers = Customer.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in customers]), 200
