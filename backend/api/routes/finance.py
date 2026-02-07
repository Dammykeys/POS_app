from flask import Blueprint, jsonify, request
from ..models import db, Account, Transaction
from flask_jwt_extended import jwt_required

finance_bp = Blueprint('finance', __name__)

@finance_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    accounts = Account.query.all()
    return jsonify([{
        'id': a.id,
        'name': a.name,
        'type': a.type,
        'balance': str(a.balance),
        'code': a.code
    } for a in accounts]), 200

@finance_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'account_id': t.account_id,
        'type': t.type,
        'amount': str(t.amount),
        'description': t.description,
        'date': t.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for t in transactions]), 200

@finance_bp.route('/transactions', methods=['POST'])
@jwt_required()
def add_transaction():
    data = request.json
    account = Account.query.get(data.get('account_id'))
    
    if not account:
        return jsonify({'message': 'Account not found'}), 404
        
    amount = float(data.get('amount', 0))
    t_type = data.get('type') # 'credit' or 'debit'
    
    new_transaction = Transaction(
        account_id=account.id,
        amount=amount,
        type=t_type,
        description=data.get('description'),
        reference=data.get('reference')
    )
    
    # Update Account Balance
    if t_type == 'credit':
        account.balance += amount
    else:
        account.balance -= amount
        
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify({'message': 'Transaction recorded', 'id': new_transaction.id}), 201
