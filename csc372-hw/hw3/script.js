// Function to handle dish selection and description display
function handleDishSelection(event) {
    const clickedDish = event.currentTarget;
    const container = clickedDish.closest('.dish-container');
    const dishes = container.querySelectorAll('.dish-item');
    const description = container.nextElementSibling;

    dishes.forEach(dish => dish.classList.remove('active'));

    clickedDish.classList.add('active');

    const name = clickedDish.dataset.name;
    const price = clickedDish.dataset.price;
    const desc = clickedDish.dataset.description;

    description.innerHTML = `
        <h4>${name}</h4>
        <p>Price: $${price}</p>
        <p>${desc}</p>
    `;
    description.classList.add('active');

    const allDescriptions = document.querySelectorAll('.dish-description');
    allDescriptions.forEach(desc => {
        if (desc !== description) {
            desc.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const dishItems = document.querySelectorAll('.dish-item');
    dishItems.forEach(item => {
        item.addEventListener('click', handleDishSelection);
    });
});

const menuItems = [
    { name: "Margherita Madness", price: 12.99 },
    { name: "Pepperoni Paradise", price: 14.99 },
    { name: "Veggie Delight Calzone", price: 13.99 },
    { name: "Rainbow Roll", price: 15.99 },
    { name: "Spicy Tuna Poke Bowl", price: 13.99 },
    { name: "Vegetarian Futomaki", price: 11.99 },
    { name: "Classic Cheeseburger", price: 10.99 },
    { name: "Veggie Burger Deluxe", price: 12.99 },
    { name: "Loaded Bacon Cheese Fries", price: 8.99 }
];

const mealPlan = [];

function displayMenuItems() {
    const menuList = document.getElementById('menu-list');
    if (menuList) {
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `${item.name} - $${item.price.toFixed(2)} <button onclick="addToPlan('${item.name}', ${item.price})">Add to Plan</button>`;
            menuList.appendChild(li);
        });
    }
}

function addToPlan(name, price) {
    mealPlan.push({ name, price });
    updatePlanDisplay();
}

function removeFromPlan(index) {
    mealPlan.splice(index, 1);
    updatePlanDisplay();
}

function updatePlanDisplay() {
    const planList = document.getElementById('plan-list');
    if (planList) {
        planList.innerHTML = '';
        let total = 0;

        mealPlan.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${item.name} - $${item.price.toFixed(2)} 
                <button onclick="removeFromPlan(${index})">Remove</button>
                <button onclick="addToPlan('${item.name}', ${item.price})">Add Another</button>`;
            planList.appendChild(li);
            total += item.price;
        });

        const totalElement = document.getElementById('total');
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    }
}

window.onload = function() {
    if (document.getElementById('menu-list')) {
        displayMenuItems();
    }
};
