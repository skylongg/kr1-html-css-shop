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

// The dialog exists only on index.html.
if (orderDialog) {
  // Получаем все кнопки «Заказать».
  const orderButtons = document.querySelectorAll('[data-product]');

  // Close buttons: the cross and "Закрыть".
  const closeButtons = document.querySelectorAll('[data-close-dialog]');

  // Получаем скрытое поле, в которое будет записан выбранный товар.
  const selectedProductInput = document.getElementById('selected-product');

  // Product name shown in the dialog.
  const dialogProduct = document.getElementById('order-dialog-product');

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;

      // Записываем название товара в скрытое поле формы и в окно.
      selectedProductInput.value = productName;
      dialogProduct.textContent = productName;

      // Открываем модальное окно.
      orderDialog.showModal();
    });
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
      orderDialog.querySelector('.order-dialog__close').focus();
    }
  });
}
