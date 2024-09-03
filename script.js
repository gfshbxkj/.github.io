let trips = [];

function renderTripList() {
    console.log('renderTripList נקראה. מספר הטיולים:', trips.length);
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>הרפתקאות שלנו</h2>
        <div class="trip-list" id="tripList"></div>
    `;

    const tripList = document.getElementById('tripList');
    trips.forEach((trip, index) => {
        const tripCard = document.createElement('div');
        tripCard.className = 'trip-card fade-in';
        tripCard.style.animationDelay = `${index * 0.1}s`;
        tripCard.innerHTML = `
            <h3>${trip.name}</h3>
            <p>תאריך: ${trip.date}</p>
            <button class="show-details-btn" data-index="${index}">גלה עוד</button>
            <button class="delete-trip-btn" data-index="${index}">מחק טיול</button>
        `;
        tripList.appendChild(tripCard);
    });

    // הוספת מאזיני אירועים לכפתורים
    document.querySelectorAll('.show-details-btn, .delete-trip-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            if (this.classList.contains('show-details-btn')) {
                showTripDetails(index);
            } else if (this.classList.contains('delete-trip-btn')) {
                deleteTrip(index);
            }
        });
    });
}

function showNewTripForm() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>הרפתקה חדשה</h2>
        <form id="newTripForm" class="form-group fade-in">
            <div class="form-group">
                <label for="tripName">שם הטיול:</label>
                <input type="text" id="tripName" required>
            </div>
            <div class="form-group">
                <label for="tripDate">תאריך:</label>
                <input type="date" id="tripDate" required>
            </div>
            <button type="submit">צור טיול</button>
        </form>
    `;

    document.getElementById('newTripForm').addEventListener('submit', addNewTrip);
}

function addNewTrip(event) {
    event.preventDefault();
    const name = document.getElementById('tripName').value;
    const date = document.getElementById('tripDate').value;
    trips.push({ name, date, expenses: [], members: [] });
    saveTrips();
    renderTripList();
}

function showTripDetails(index) {
    console.log('showTripDetails נקראה עם אינדקס:', index);
    if (isNaN(index) || index < 0 || index >= trips.length) {
        console.error('אינדקס לא חוקי:', index);
        return;
    }
    const trip = trips[index];
    if (!trip) {
        console.error('לא נמצא טיול עם האינדקס:', index);
        return;
    }
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>${trip.name}</h2>
        <p>תאריך: ${trip.date}</p>
        <h3>חברים</h3>
        <ul id="memberList"></ul>
        <button onclick="showAddMemberForm(${index})">הוסף חבר</button>
        <h3>הוצאות</h3>
        <ul id="expenseList"></ul>
        <button onclick="showAddExpenseForm(${index})">הוסף הוצאה</button>
        <button onclick="showSummary(${index})">הצג סיכום</button>
        <button onclick="renderTripList()">חזרה לרשימת הטיולים</button>
    `;

    renderMembers(trip, index);
    renderExpenses(trip, index);
}

function showAddMemberForm(tripIndex) {
    const app = document.getElementById('app');
    app.innerHTML += `
        <div id="addMemberForm" class="form-group fade-in">
            <h3>הוסף חבר</h3>
            <input type="text" id="memberName" placeholder="שם החבר" required>
            <button onclick="addMember(${tripIndex})">הוסף</button>
        </div>
    `;
}

function addMember(tripIndex) {
    const memberName = document.getElementById('memberName').value;
    if (memberName) {
        trips[tripIndex].members.push(memberName);
        saveTrips();
        showTripDetails(tripIndex);
    }
}

function renderMembers(trip, tripIndex) {
    const memberList = document.getElementById('memberList');
    memberList.innerHTML = '';
    trip.members.forEach((member, index) => {
        const li = document.createElement('li');
        li.className = 'fade-in';
        li.style.animationDelay = `${index * 0.1}s`;
        li.innerHTML = `
            ${member}
            <button onclick="editMember(${tripIndex}, ${index})">ערוך</button>
            <button onclick="removeMember(${tripIndex}, ${index})">הסר</button>
        `;
        memberList.appendChild(li);
    });
}

function editMember(tripIndex, memberIndex) {
    const newName = prompt("הכנס שם חדש לחבר:", trips[tripIndex].members[memberIndex]);
    if (newName) {
        trips[tripIndex].members[memberIndex] = newName;
        saveTrips();
        showTripDetails(tripIndex);
    }
}

function removeMember(tripIndex, memberIndex) {
    if (confirm("האם אתה בטוח שברצונך להסיר חבר זה?")) {
        trips[tripIndex].members.splice(memberIndex, 1);
        saveTrips();
        showTripDetails(tripIndex);
    }
}

function showAddExpenseForm(tripIndex) {
    const app = document.getElementById('app');
    app.innerHTML += `
        <div id="addExpenseForm" class="form-group fade-in">
            <h3>הוסף הוצאה</h3>
            <div class="form-group">
                <label for="expenseDescription">תיאור ההוצאה:</label>
                <input type="text" id="expenseDescription" placeholder="תיאור ההוצאה" required>
            </div>
            <div class="form-group">
                <label for="expenseAmount">סכום:</label>
                <input type="number" id="expenseAmount" placeholder="סכום" required>
            </div>
            <div class="form-group">
                <label for="expensePayer">שולם על ידי:</label>
                <select id="expensePayer">
                    ${trips[tripIndex].members.map(member => `<option value="${member}">${member}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="expenseDate">תאריך:</label>
                <input type="date" id="expenseDate" required>
            </div>
            <button onclick="addExpense(${tripIndex})">הוסף</button>
        </div>
    `;
}

function addExpense(tripIndex) {
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const payer = document.getElementById('expensePayer').value;
    const date = document.getElementById('expenseDate').value;
    
    if (description && amount && payer && date) {
        trips[tripIndex].expenses.push({ description, amount, payer, date });
        saveTrips();
        showTripDetails(tripIndex);
    }
}

function renderExpenses(trip, tripIndex) {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    trip.expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.className = 'fade-in';
        li.style.animationDelay = `${index * 0.1}s`;
        li.innerHTML = `
            ${expense.description}: ${expense.amount} ש"ח
            <br>שולם על ידי: ${expense.payer}
            <br>תאריך: ${expense.date}
            <button onclick="editExpense(${tripIndex}, ${index})">ערוך</button>
            <button onclick="removeExpense(${tripIndex}, ${index})">הסר</button>
        `;
        expenseList.appendChild(li);
    });
}

function editExpense(tripIndex, expenseIndex) {
    const expense = trips[tripIndex].expenses[expenseIndex];
    const app = document.getElementById('app');
    app.innerHTML = `
        <h3>ערוך הוצאה</h3>
        <div class="form-group">
            <label for="editExpenseDescription">תיאור ההוצאה:</label>
            <input type="text" id="editExpenseDescription" value="${expense.description}" required>
        </div>
        <div class="form-group">
            <label for="editExpenseAmount">סכום:</label>
            <input type="number" id="editExpenseAmount" value="${expense.amount}" required>
        </div>
        <div class="form-group">
            <label for="editExpensePayer">שולם על ידי:</label>
            <select id="editExpensePayer">
                ${trips[tripIndex].members.map(member => 
                    `<option value="${member}" ${member === expense.payer ? 'selected' : ''}>${member}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group">
            <label for="editExpenseDate">תאריך:</label>
            <input type="date" id="editExpenseDate" value="${expense.date}" required>
        </div>
        <button onclick="updateExpense(${tripIndex}, ${expenseIndex})">עדכן</button>
        <button onclick="showTripDetails(${tripIndex})">ביטול</button>
    `;
}

function updateExpense(tripIndex, expenseIndex) {
    const description = document.getElementById('editExpenseDescription').value;
    const amount = parseFloat(document.getElementById('editExpenseAmount').value);
    const payer = document.getElementById('editExpensePayer').value;
    const date = document.getElementById('editExpenseDate').value;
    
    if (description && amount && payer && date) {
        trips[tripIndex].expenses[expenseIndex] = { description, amount, payer, date };
        saveTrips();
        showTripDetails(tripIndex);
    }
}

function removeExpense(tripIndex, expenseIndex) {
    if (confirm("האם אתה בטוח שברצונך להסיר הוצאה זו?")) {
        trips[tripIndex].expenses.splice(expenseIndex, 1);
        saveTrips();
        showTripDetails(tripIndex);
    }
}

function showSummary(tripIndex) {
    const trip = trips[tripIndex];
    const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const perPersonExpense = totalExpenses / trip.members.length;
    
    const summary = {};
    trip.members.forEach(member => {
        summary[member] = {
            paid: 0,
            owes: perPersonExpense
        };
    });
    
    trip.expenses.forEach(expense => {
        summary[expense.payer].paid += expense.amount;
    });
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>סיכום הוצאות - ${trip.name}</h2>
        <p>סך כל ההוצאות: ${totalExpenses.toFixed(2)} ש"ח</p>
        <h3>סיכום לפי חברים:</h3>
        <ul id="summaryList" class="fade-in"></ul>
        <h3>התחשבנות:</h3>
        <ul id="settlementList" class="fade-in"></ul>
        <button onclick="showTripDetails(${tripIndex})">חזרה לפרטי הטיול</button>
        <button onclick="shareSummary(${tripIndex})">שתף סיכום</button>
    `;
    
    const summaryList = document.getElementById('summaryList');
    for (const [member, data] of Object.entries(summary)) {
        const balance = data.paid - data.owes;
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${member}:</strong>
            <br>שילם: ${data.paid.toFixed(2)} ש"ח
            <br>צריך לשלם: ${data.owes.toFixed(2)} ש"ח
            <br>מאזן: ${balance.toFixed(2)} ש"ח
            ${balance > 0 ? '(צריך לקבל)' : '(צריך לשלם)'}
        `;
        summaryList.appendChild(li);
    }
    
    const settlementList = document.getElementById('settlementList');
    const debtors = Object.entries(summary).filter(([, data]) => data.paid < data.owes);
    const creditors = Object.entries(summary).filter(([, data]) => data.paid > data.owes);
    
    debtors.forEach(([debtor, debtorData]) => {
        let remainingDebt = debtorData.owes - debtorData.paid;
        creditors.forEach(([creditor, creditorData]) => {
            if (remainingDebt > 0 && creditorData.paid > creditorData.owes) {
                const payment = Math.min(remainingDebt, creditorData.paid - creditorData.owes);
                const li = document.createElement('li');
                li.textContent = `${debtor} צריך לשלם ${payment.toFixed(2)} ש"ח ל-${creditor}`;
                settlementList.appendChild(li);
                remainingDebt -= payment;
                creditorData.paid -= payment;
            }
        });
    });
}

function shareSummary(tripIndex) {
    const trip = trips[tripIndex];
    const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    let summaryText = `סיכום הוצאות - ${trip.name}\n`;
    summaryText += `סך כל ההוצאות: ${totalExpenses.toFixed(2)} ש"ח\n\n`;
    
    summaryText += "סיכום לפי חברים:\n";
    const perPersonExpense = totalExpenses / trip.members.length;
    const summary = {};
    trip.members.forEach(member => {
        const paid = trip.expenses.filter(e => e.payer === member).reduce((sum, e) => sum + e.amount, 0);
        const balance = paid - perPersonExpense;
        summaryText += `${member}:\n`;
        summaryText += `  שילם: ${paid.toFixed(2)} ש"ח\n`;
        summaryText += `  צריך לשלם: ${perPersonExpense.toFixed(2)} ש"ח\n`;
        summaryText += `  מאזן: ${balance.toFixed(2)} ש"ח ${balance > 0 ? '(צריך לקבל)' : '(צריך לשלם)'}\n\n`;
        summary[member] = { paid, owes: perPersonExpense };
    });

    summaryText += "התחשבנות:\n";
    const debtors = Object.entries(summary).filter(([, data]) => data.paid < data.owes);
    const creditors = Object.entries(summary).filter(([, data]) => data.paid > data.owes);
    
    debtors.forEach(([debtor, debtorData]) => {
        let remainingDebt = debtorData.owes - debtorData.paid;
        creditors.forEach(([creditor, creditorData]) => {
            if (remainingDebt > 0 && creditorData.paid > creditorData.owes) {
                const payment = Math.min(remainingDebt, creditorData.paid - creditorData.owes);
                summaryText += `${debtor} צריך לשלם ${payment.toFixed(2)} ש"ח ל-${creditor}\n`;
                remainingDebt -= payment;
                creditorData.paid -= payment;
            }
        });
    });
    
    // הצגת הסיכום והגרף
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>שיתוף סיכום</h2>
        <textarea rows="15" cols="50" readonly>${summaryText}</textarea>
        <br>
        <button onclick="copyToClipboard()">העתק טקסט</button>
        <br><br>
        <h3>תצוגה ויזואלית</h3>
        <canvas id="expensesChart" width="500" height="300"></canvas>
        <br>
        <button onclick="showSummary(${tripIndex})">חזרה לסיכום</button>
    `;
    
    // ציור הגרף
    const canvas = document.getElementById('expensesChart');
    const ctx = canvas.getContext('2d');
    
    // נקה את הקנבס
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // הגדרת משתנים לגרף
    const barWidth = 40;
    const spacing = 20;
    const startY = canvas.height - 30;
    
    // מצא את הערך המקסימלי לקנה מידה
    const maxPaid = Math.max(...Object.values(summary).map(s => s.paid));
    
    // ציור הגרף
    Object.entries(summary).forEach(([member, data], index) => {
        const x = index * (barWidth + spacing) + spacing;
        const barHeight = (data.paid / maxPaid) * (startY - 50);
        
        // ציור העמודה
        ctx.fillStyle = `hsl(${index * 360 / trip.members.length}, 70%, 50%)`;
        ctx.fillRect(x, startY - barHeight, barWidth, barHeight);
        
        // כתיבת שם החבר
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(member, x + barWidth / 2, startY + 15);
        
        // כתיבת הסכום
        ctx.fillText(`${data.paid.toFixed(0)} ש"ח`, x + barWidth / 2, startY - barHeight - 5);
    });
    
    // ציור קו האפס
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(canvas.width, startY);
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function copyToClipboard() {
    const textarea = document.querySelector('textarea');
    textarea.select();
    document.execCommand('copy');
    alert('הטקסט הועתק ללוח');
}

function saveTrips() {
    localStorage.setItem('trips', JSON.stringify(trips));
}

function loadTrips() {
    console.log('loadTrips נקראה');
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
        trips = JSON.parse(savedTrips);
        console.log('טיולים נטענו:', trips);
    } else {
        console.log('לא נמצאו טיולים שמורים');
    }
}

// קרא לפונקציה זו בתחילת הסקריפט
loadTrips();

function deleteTrip(index) {
    console.log('deleteTrip נקראה עם אינדקס:', index);
    if (isNaN(index) || index < 0 || index >= trips.length) {
        console.error('אינדקס לא חוקי:', index);
        return;
    }
    if (confirm("האם אתה בטוח שברצונך למחוק טיול זה?")) {
        trips.splice(index, 1);
        saveTrips();
        renderTripList();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded נטען');
    loadTrips();
    console.log('טיולים נטענו:', trips);
    document.getElementById('newTripBtn').addEventListener('click', showNewTripForm);
    renderTripList();

    // הוספת מאזין אירועים למסך מגע
    document.body.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'BUTTON') {
            e.preventDefault();
            e.target.click();
        }
    }, false);

    // הוספת מאזיני אירועים למצב מסך מלא
    document.addEventListener('fullscreenchange', renderTripList);
    document.addEventListener('webkitfullscreenchange', renderTripList);
    document.addEventListener('mozfullscreenchange', renderTripList);
    document.addEventListener('MSFullscreenChange', renderTripList);
});

// הוספת אנימציות לאלמנטים חדשים
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            e.target.classList.add('button-click');
            setTimeout(() => {
                e.target.classList.remove('button-click');
            }, 200);
        }
    });
});
