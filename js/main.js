// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Show the error text under the field.
function showError(field) {
  field.setAttribute('aria-invalid', 'true');

  const error = document.getElementById(field.id + '-error');
  if (error) {
    error.textContent = field.dataset.error;
  }
}

// Hide the error text under the field.
function hideError(field) {
  field.removeAttribute('aria-invalid');

  const error = document.getElementById(field.id + '-error');
  if (error) {
    error.textContent = '';
  }
}

// Number with spaces: 12500 -> "12 500".
function formatPrice(value) {
  return value.toLocaleString('ru-RU');
}

// The dialog exists only on index.html.
if (orderDialog) {
  // Delivery and promo code settings.
  const COURIER_PRICE = 300;
  const FREE_DELIVERY_FROM = 5000;
  const PROMO_CODE = 'SHOP10';
  const PROMO_DISCOUNT = 10;

  // Получаем все кнопки «Заказать».
  const orderButtons = document.querySelectorAll('[data-product]');

  // Close buttons: the cross, "Закрыть" and "Продолжить покупки".
  const closeButtons = document.querySelectorAll('[data-close-dialog]');

  // Получаем скрытое поле, в которое будет записан выбранный товар.
  const selectedProductInput = document.getElementById('selected-product');

  // Product name and price shown in the dialog.
  const dialogProduct = document.getElementById('order-dialog-product');
  const dialogPrice = document.getElementById('order-dialog-price');

  // Quantity: input and the "−" / "+" buttons.
  const quantityInput = document.getElementById('order-quantity');
  const quantityButtons = document.querySelectorAll('.quantity__button');

  // Promo code.
  const promoInput = document.getElementById('order-promo');
  const promoButton = document.getElementById('apply-promo');
  const promoMessage = document.getElementById('order-promo-message');

  // Total block.
  const totalGoods = document.getElementById('total-goods');
  const totalDelivery = document.getElementById('total-delivery');
  const totalDiscount = document.getElementById('total-discount');
  const totalSum = document.getElementById('total-sum');

  // Price of the selected product and the discount in percent.
  let productPrice = 0;
  let discountPercent = 0;

  // Count the order total and show it in the dialog.
  function updateTotal() {
    const quantity = Number(quantityInput.value);
    const goods = productPrice * quantity;
    const isCourier = orderForm.elements.delivery.value === 'courier';
    const delivery = isCourier && goods < FREE_DELIVERY_FROM ? COURIER_PRICE : 0;
    const discount = Math.round(goods * discountPercent / 100);
    const sum = goods + delivery - discount;

    totalGoods.textContent = formatPrice(goods);
    totalDelivery.textContent = formatPrice(delivery);
    totalDiscount.textContent = formatPrice(discount);
    totalSum.textContent = formatPrice(sum);

    // "−" is disabled at 1 item, "+" is disabled at 10 items.
    quantityButtons[0].disabled = quantity <= Number(quantityInput.min);
    quantityButtons[1].disabled = quantity >= Number(quantityInput.max);

    return sum;
  }

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название и цену товара из data-атрибутов.
      const productName = button.dataset.product;
      productPrice = Number(button.dataset.price);

      // Записываем название товара в скрытое поле формы и в окно.
      selectedProductInput.value = productName;
      dialogProduct.textContent = productName;
      dialogPrice.textContent = formatPrice(productPrice);

      updateTotal();

      // Открываем модальное окно.
      orderDialog.showModal();
    });
  });

  // "−" and "+" change the quantity by data-step.
  quantityButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const newValue = Number(quantityInput.value) + Number(button.dataset.step);

      if (newValue >= Number(quantityInput.min) && newValue <= Number(quantityInput.max)) {
        quantityInput.value = newValue;
      }

      updateTotal();
    });
  });

  // Typed quantity is kept between 1 and 10.
  quantityInput.addEventListener('change', () => {
    const min = Number(quantityInput.min);
    const max = Number(quantityInput.max);
    const value = Math.round(Number(quantityInput.value)) || min;

    quantityInput.value = Math.min(Math.max(value, min), max);
    updateTotal();
  });

  // Delivery choice changes the total.
  orderForm.addEventListener('change', (event) => {
    if (event.target.name === 'delivery') {
      updateTotal();
    }
  });

  // Check the promo code.
  function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();

    if (code === PROMO_CODE) {
      discountPercent = PROMO_DISCOUNT;
      promoMessage.textContent = 'Промокод применён: скидка ' + PROMO_DISCOUNT + '%.';
      promoMessage.className = 'promo__message promo__message--success';
    } else {
      discountPercent = 0;
      promoMessage.textContent = code ? 'Такого промокода нет.' : 'Введите промокод.';
      promoMessage.className = 'promo__message promo__message--error';
    }

    updateTotal();
  }

  promoButton.addEventListener('click', applyPromo);

  // Enter in the promo field applies the code instead of sending the form.
  promoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyPromo();
    }
  });

  // The promo code and the discount are removed when the form is cleared.
  orderForm.addEventListener('reset', () => {
    discountPercent = 0;
    promoMessage.textContent = '';
  });

  // "Очистить" clears the fields but keeps the dialog open.
  document.getElementById('clear-order-form').addEventListener('click', () => {
    orderForm.reset();
    updateTotal();
  });

  // Закрываем модальное окно по кнопкам.
  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      orderDialog.close();
    });
  });

  // Close the dialog on a click on the dark background.
  orderDialog.addEventListener('click', (event) => {
    if (event.target === orderDialog) {
      orderDialog.close();
    }
  });

  // After closing, clear the form and show it again.
  orderDialog.addEventListener('close', () => {
    orderForm.reset();
    orderForm.hidden = false;
  });

  // Text for the success screen, built before the form is cleared.
  orderForm.addEventListener('submit', () => {
    if (orderForm.checkValidity()) {
      const sum = updateTotal();

      document.getElementById('success-text').textContent =
        orderForm.elements.name.value + ', ваш заказ «' + selectedProductInput.value + '» × ' +
        quantityInput.value + ' на сумму ' + formatPrice(sum) + ' руб. принят. ' +
        'Менеджер свяжется с вами в течение рабочего дня.';
    }
  });
}

// The form is on index.html (in the dialog) and on order.html.
if (orderForm) {
  // Hide the error as soon as the field is filled correctly.
  orderForm.addEventListener('input', (event) => {
    if (event.target.checkValidity()) {
      hideError(event.target);
    }
  });

  // Clear errors and the message when the form is reset.
  orderForm.addEventListener('reset', () => {
    Array.from(orderForm.elements).forEach(hideError);
    successMessage.hidden = true;
  });

  // Обрабатываем отправку формы.
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Fields that the browser checks (required, type, pattern).
    const fields = Array.from(orderForm.elements).filter((field) => field.willValidate);
    const invalidFields = fields.filter((field) => !field.checkValidity());

    fields.forEach(hideError);
    invalidFields.forEach(showError);

    // Move focus to the first field with an error.
    if (invalidFields.length > 0) {
      invalidFields[0].focus();
      return;
    }

    // Очищаем форму.
    orderForm.reset();

    // Показываем сообщение об успешной отправке.
    successMessage.hidden = false;

    // In the dialog the form is replaced by the message.
    if (orderDialog) {
      orderForm.hidden = true;
      successMessage.querySelector('button').focus();
    }
  });
}
