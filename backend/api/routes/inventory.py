from flask import Blueprint, jsonify, request
from ..models import db, Product, Category, Warehouse

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'sku': p.sku,
        'price': str(p.price),
        'stock_quantity': p.stock_quantity,
        'category': p.category.name if p.category else 'Uncategorized'
    } for p in products]), 200

@inventory_bp.route('/products', methods=['POST'])
def add_product():
    data = request.json
    new_product = Product(
        name=data.get('name'),
        sku=data.get('sku'),
        price=data.get('price'),
        stock_quantity=data.get('stock_quantity', 0),
        category_id=data.get('category_id'),
        warehouse_id=data.get('warehouse_id')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully', 'id': new_product.id}), 201

@inventory_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories]), 200
