// 全局变量
let dbConnection = null;
let currentTable = null;
let tableFields = [];

// DOM元素
const dbTypeSelect = document.getElementById('dbType');
const hostInput = document.getElementById('host');
const portInput = document.getElementById('port');
const databaseInput = document.getElementById('database');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const connectBtn = document.getElementById('connectBtn');
const tableSelect = document.getElementById('tableSelect');
const fieldsContainer = document.getElementById('fieldsContainer');
const conditionsContainer = document.getElementById('conditionsContainer');
const addConditionBtn = document.getElementById('addConditionBtn');
const orderContainer = document.getElementById('orderContainer');
const addOrderBtn = document.getElementById('addOrderBtn');
const groupByCheckbox = document.getElementById('groupByCheckbox');
const groupByContainer = document.getElementById('groupByContainer');
const groupByField = document.getElementById('groupByField');
const countCheckbox = document.getElementById('countCheckbox');
const sumCheckbox = document.getElementById('sumCheckbox');
const avgCheckbox = document.getElementById('avgCheckbox');
const generateSqlBtn = document.getElementById('generateSqlBtn');
const sqlOutput = document.getElementById('sqlOutput');
const copySqlBtn = document.getElementById('copySqlBtn');
const executeSqlBtn = document.getElementById('executeSqlBtn');
const resultContainer = document.getElementById('resultContainer');

// 初始化应用
function initApp() {
    // 设置默认值
    hostInput.value = 'localhost';
    portInput.value = '3306';
    
    // 事件监听器
    connectBtn.addEventListener('click', handleDatabaseConnection);
    tableSelect.addEventListener('change', handleTableSelect);
    addConditionBtn.addEventListener('click', addConditionRow);
    addOrderBtn.addEventListener('click', addOrderRow);
    groupByCheckbox.addEventListener('change', toggleGroupBy);
    generateSqlBtn.addEventListener('click', generateSQL);
    copySqlBtn.addEventListener('click', copySQL);
    executeSqlBtn.addEventListener('click', executeSQL);
    
    // 初始条件行
    addConditionRow();
    addOrderRow();
}

// 处理数据库连接
async function handleDatabaseConnection() {
    const dbType = dbTypeSelect.value;
    const host = hostInput.value;
    const port = portInput.value;
    const database = databaseInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    if (!host || !database || !username) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    connectBtn.disabled = true;
    connectBtn.innerHTML = '<span class="loading"></span> 连接中...';
    
    try {
        // 模拟数据库连接（实际项目中需要后端API）
        await simulateDatabaseConnection(dbType, host, port, database, username, password);
        
        dbConnection = { dbType, host, port, database, username };
        showMessage('数据库连接成功', 'success');
        
        // 启用表选择
        tableSelect.disabled = false;
        tableSelect.innerHTML = '<option value="">请选择表</option>';
        
        // 模拟获取表列表
        const tables = await getTableList();
        tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table;
            option.textContent = table;
            tableSelect.appendChild(option);
        });
        
    } catch (error) {
        showMessage(`连接失败: ${error.message}`, 'error');
    } finally {
        connectBtn.disabled = false;
        connectBtn.textContent = '连接数据库';
    }
}

// 模拟数据库连接
async function simulateDatabaseConnection(dbType, host, port, database, username, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 模拟连接成功（实际项目中需要真实验证）
            if (database && username) {
                resolve();
            } else {
                reject(new Error('数据库连接失败，请检查凭据'));
            }
        }, 1000);
    });
}

// 获取表列表（模拟）
async function getTableList() {
    // 模拟表列表
    return ['users', 'products', 'orders', 'customers', 'categories'];
}

// 处理表选择
async function handleTableSelect(event) {
    const tableName = event.target.value;
    if (!tableName) return;
    
    currentTable = tableName;
    
    try {
        // 获取表字段
        tableFields = await getTableFields(tableName);
        populateFields();
        populateConditionFields();
        populateOrderFields();
        populateGroupByFields();
        
        generateSqlBtn.disabled = false;
        
    } catch (error) {
        showMessage(`获取表字段失败: ${error.message}`, 'error');
    }
}

// 获取表字段（模拟）
async function getTableFields(tableName) {
    // 模拟不同表的字段
    const fieldMap = {
        'users': ['id', 'name', 'email', 'age', 'created_at'],
        'products': ['id', 'name', 'price', 'category_id', 'stock', 'created_at'],
        'orders': ['id', 'user_id', 'total_amount', 'status', 'created_at'],
        'customers': ['id', 'first_name', 'last_name', 'email', 'phone', 'address'],
        'categories': ['id', 'name', 'description']
    };
    
    return fieldMap[tableName] || ['id', 'name'];
}

// 填充字段选择
function populateFields() {
    fieldsContainer.innerHTML = '';
    tableFields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'field-checkbox';
        div.innerHTML = `
            <input type="checkbox" id="field_${field}" value="${field}">
            <label for="field_${field}">${field}</label>
        `;
        fieldsContainer.appendChild(div);
    });
}

// 填充条件字段
function populateConditionFields() {
    const conditionFields = document.querySelectorAll('.condition-field');
    conditionFields.forEach(select => {
        select.disabled = false;
        select.innerHTML = '<option value="">选择字段</option>';
        tableFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field;
            select.appendChild(option);
        });
    });
}

// 填充排序字段
function populateOrderFields() {
    const orderFields = document.querySelectorAll('.order-field');
    orderFields.forEach(select => {
        select.disabled = false;
        select.innerHTML = '<option value="">选择字段</option>';
        tableFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field;
            select.appendChild(option);
        });
    });
}

// 填充分组字段
function populateGroupByFields() {
    groupByField.disabled = false;
    groupByField.innerHTML = '<option value="">选择分组字段</option>';
    tableFields.forEach(field => {
        const option = document.createElement('option');
        option.value = field;
        option.textContent = field;
        groupByField.appendChild(option);
    });
}

// 添加条件行
function addConditionRow() {
    const row = document.createElement('div');
    row.className = 'condition-row';
    row.innerHTML = `
        <select class="condition-field" ${tableFields.length ? '' : 'disabled'}>
            <option value="">${tableFields.length ? '选择字段' : '请先选择表'}</option>
            ${tableFields.map(field => `<option value="${field}">${field}</option>`).join('')}
        </select>
        <select class="condition-operator">
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">></option>
            <option value="<"><</option>
            <option value=">=">>=</option>
            <option value="<="><=</option>
            <option value="LIKE">LIKE</option>
            <option value="IN">IN</option>
        </select>
        <input type="text" class="condition-value" placeholder="值">
        <button class="btn-remove-condition" onclick="removeConditionRow(this)">×</button>
    `;
    conditionsContainer.appendChild(row);
}

// 移除条件行
function removeConditionRow(button) {
    if (conditionsContainer.children.length > 1) {
        button.parentElement.remove();
    }
}

// 添加排序行
function addOrderRow() {
    const row = document.createElement('div');
    row.className = 'order-row';
    row.innerHTML = `
        <select class="order-field" ${tableFields.length ? '' : 'disabled'}>
            <option value="">${tableFields.length ? '选择字段' : '请先选择表'}</option>
            ${tableFields.map(field => `<option value="${field}">${field}</option>`).join('')}
        </select>
        <select class="order-direction">
            <option value="ASC">升序 (ASC)</option>
            <option value="DESC">降序 (DESC)</option>
        </select>
        <button class="btn-remove-order" onclick="removeOrderRow(this)">×</button>
    `;
    orderContainer.appendChild(row);
}

// 移除排序行
function removeOrderRow(button) {
    if (orderContainer.children.length > 1) {
        button.parentElement.remove();
    }
}

// 切换分组显示
function toggleGroupBy() {
    groupByContainer.style.display = groupByCheckbox.checked ? 'block' : 'none';
}

// 生成SQL语句
function generateSQL() {
    if (!currentTable) {
        showMessage('请先选择表', 'error');
        return;
    }
    
    const selectedFields = getSelectedFields();
    const conditions = getConditions();
    const orders = getOrders();
    const groupBy = getGroupBy();
    const aggregates = getAggregates();
    
    let sql = 'SELECT ';
    
    // 添加字段
    if (aggregates.length > 0 && groupBy.groupByField) {
        // 如果有聚合函数和分组，显示聚合结果和分组字段
        sql += aggregates.join(', ') + ', ' + groupBy.groupByField;
    } else if (aggregates.length > 0) {
        // 只有聚合函数
        sql += aggregates.join(', ');
    } else if (selectedFields.length > 0) {
        // 普通字段选择
        sql += selectedFields.join(', ');
    } else {
        sql += '*';
    }
    
    sql += ` FROM ${currentTable}`;
    
    // 添加条件
    if (conditions) {
        sql += ` WHERE ${conditions}`;
    }
    
    // 添加分组
    if (groupBy.groupByField) {
        sql += ` GROUP BY ${groupBy.groupByField}`;
    }
    
    // 添加排序
    if (orders) {
        sql += ` ORDER BY ${orders}`;
    }
    
    sqlOutput.value = sql;
    copySqlBtn.disabled = false;
    executeSqlBtn.disabled = false;
}

// 获取选择的字段
function getSelectedFields() {
    const selected = [];
    document.querySelectorAll('.field-checkbox input:checked').forEach(checkbox => {
        selected.push(checkbox.value);
    });
    return selected;
}

// 获取条件
function getConditions() {
    const conditions = [];
    document.querySelectorAll('.condition-row').forEach(row => {
        const field = row.querySelector('.condition-field').value;
        const operator = row.querySelector('.condition-operator').value;
        const value = row.querySelector('.condition-value').value;
        
        if (field && value) {
            let conditionValue = value;
            if (operator === 'LIKE') {
                conditionValue = `'%${value}%'`;
            } else if (operator === 'IN') {
                conditionValue = `(${value.split(',').map(v => `'${v.trim()}'`).join(',')})`;
            } else if (isNaN(value)) {
                conditionValue = `'${value}'`;
            }
            conditions.push(`${field} ${operator} ${conditionValue}`);
        }
    });
    
    return conditions.length > 0 ? conditions.join(' AND ') : null;
}

// 获取排序
function getOrders() {
    const orders = [];
    document.querySelectorAll('.order-row').forEach(row => {
        const field = row.querySelector('.order-field').value;
        const direction = row.querySelector('.order-direction').value;
        
        if (field) {
            orders.push(`${field} ${direction}`);
        }
    });
    
    return orders.length > 0 ? orders.join(', ') : null;
}

// 获取分组
function getGroupBy() {
    return {
        groupByField: groupByCheckbox.checked ? groupByField.value : null
    };
}

// 获取聚合函数
function getAggregates() {
    const aggregates = [];
    if (countCheckbox.checked) aggregates.push('COUNT(*) as count');
    if (sumCheckbox.checked) aggregates.push('SUM(price) as total_price');
    if (avgCheckbox.checked) aggregates.push('AVG(price) as avg_price');
    return aggregates;
}

// 复制SQL
function copySQL() {
    sqlOutput.select();
    document.execCommand('copy');
    showMessage('SQL已复制到剪贴板', 'success');
}

// 执行SQL查询（模拟）
async function executeSQL() {
    executeSqlBtn.disabled = true;
    executeSqlBtn.innerHTML = '<span class="loading"></span> 执行中...';
    
    try {
        // 模拟查询执行
        const results = await simulateQueryExecution(sqlOutput.value);
        displayResults(results);
        showMessage('查询执行成功', 'success');
    } catch (error) {
        showMessage(`查询执行失败: ${error.message}`, 'error');
    } finally {
        executeSqlBtn.disabled = false;
        executeSqlBtn.textContent = '执行查询';
    }
}

// 模拟查询执行
async function simulateQueryExecution(sql) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟查询结果
            const results = [];
            for (let i = 0; i < 5; i++) {
                const row = {};
                tableFields.forEach(field => {
                    row[field] = `示例数据 ${i + 1}`;
                });
                results.push(row);
            }
            resolve(results);
        }, 1500);
    });
}

// 显示查询结果
function displayResults(results) {
    if (results.length === 0) {
        resultContainer.innerHTML = '<p>没有找到结果</p>';
        return;
    }
    
    const headers = Object.keys(results[0]);
    let html = '<table class="result-table"><thead><tr>';
    
    // 表头
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // 数据行
    results.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            html += `<td>${row[header]}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    resultContainer.innerHTML = html;
}

// 显示消息
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.querySelector('.main-content').prepend(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 全局函数（用于HTML中的onclick）
window.removeConditionRow = removeConditionRow;
window.removeOrderRow = removeOrderRow;

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);
