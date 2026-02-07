from flask import Blueprint, jsonify, request
from ..models import db, Supplier, Purchase, Product
from flask_jwt_extended import jwt_required

purchases_bp = Blueprint('purchases', __name__)

@purchases_bp.route('/suppliers', methods=['GET'])
@jwt_required()
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'contact_person': s.contact_person,
        'email': s.email,
        'phone': s.phone
    } for s in suppliers]), 200

@purchases_bp.route('/suppliers', methods=['POST'])
@jwt_required()
def add_supplier():
    data = request.json
    new_supplier = Supplier(
        name=data.get('name'),
        contact_person=data.get('contact_person'),
        email=data.get('email'),
        phone=data.get('phone')
    )
    db.session.add(new_supplier)
    db.session.commit()
    return jsonify({'message': 'Supplier added', 'id': new_supplier.id}), 201

@purchases_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_purchases():
    purchases = Purchase.query.all()
    return jsonify([{
        'id': p.id,
        'supplier': p.supplier.name if p.supplier else 'Unknown',
        'product': p.product.name if p.product else 'Unknown',
        'quantity': p.quantity,
        'total_cost': str(p.total_cost),
        'status': p.status,
        'date': p.created_at.strftime('%b %d, %Y')
    } for p in purchases]), 200

@purchases_bp.route('/order', methods=['POST'])
@jwt_required()
def record_purchase():
    data = request.json
    product = Product.query.get(data.get('product_id'))
    if not product:
        return jsonify({'message': 'Product not found'}), 404
        
    quantity = int(data.get('quantity', 0))
    total_cost = float(data.get('total_cost', 0))
    
    new_purchase = Purchase(
        supplier_id=data.get('supplier_id'),
        product_id=product.id,
        quantity=quantity,
        total_cost=total_cost,
        status='received'
    )
    
    # Update Stock
    product.stock_quantity += quantity
    
    db.session.add(new_purchase)
    db.session.commit()
    
    return jsonify({'message': 'Purchase recorded and stock updated', 'id': new_purchase.id}), 201
