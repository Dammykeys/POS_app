from flask import Blueprint, jsonify, request
from models import db, Employee, Attendance, PayrollRecord
from flask_jwt_extended import jwt_required
from datetime import datetime

hr_bp = Blueprint('hr', __name__)

@hr_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        'id': e.id,
        'first_name': e.first_name,
        'last_name': e.last_name,
        'email': e.email,
        'position': e.position,
        'salary': str(e.salary),
        'hire_date': e.hire_date.strftime('%Y-%m-%d')
    } for e in employees]), 200

@hr_bp.route('/employees', methods=['POST'])
@jwt_required()
def add_employee():
    data = request.json
    new_employee = Employee(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        position=data.get('position'),
        salary=data.get('salary'),
        hire_date=datetime.strptime(data.get('hire_date'), '%Y-%m-%d') if data.get('hire_date') else datetime.utcnow()
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify({'message': 'Employee added', 'id': new_employee.id}), 201

@hr_bp.route('/payroll', methods=['GET'])
@jwt_required()
def get_payroll():
    records = PayrollRecord.query.all()
    return jsonify([{
        'id': r.id,
        'employee_name': f"{r.employee.first_name} {r.employee.last_name}",
        'period_start': r.period_start.strftime('%b %d, %Y'),
        'period_end': r.period_end.strftime('%b %d, %Y'),
        'net_pay': str(r.net_pay),
        'status': r.status
    } for r in records]), 200
