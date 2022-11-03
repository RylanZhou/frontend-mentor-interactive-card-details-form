import './style.scss';

const inputEls = document.querySelectorAll('input');
const formEl = document.querySelector('form');

// Limit input
inputEls.forEach((input) => {
  // Had to specify any type access "event.target"
  input.onkeydown = (event: any) => {
    // Accept delete key
    if (event.keyCode === 8 || event.keyCode === 9) {
      return true;
    }

    // Prevent input when length hit max
    if (event.target?.value.length >= +(input.getAttribute('maxlength') ?? Infinity)) {
      return false;
    }

    // Only accept numeric
    if (input.type === 'number' || input.name === 'cardNo' || input.name === 'cvc') {
      return event.keyCode >= 48 && event.keyCode <= 57;
    }

    return true;
  };

  // Set text preview to corresponding element, and check validity
  input.oninput = ({ target }: any) => {
    const inputValue: string = target.value;
    const name: string = target.name;

    if (name === 'name') {
      document.querySelector('#name')!.innerHTML = inputValue || 'Jane Appleseed';
      check(input, name);
    }

    if (name === 'cardNo') {
      // Insert a space after every 4 digits
      target.value = (inputValue as string)
        .replace(/\s+/g, '')
        .split('')
        .map((char, index) => (index > 0 && index % 4 === 0 ? ' ' + char : char))
        .join('');

      document.querySelector('#number')!.innerHTML = (
        inputValue.replace(/\s+/g, '') + '0000000000000000'
      )
        .substring(0, 16)
        .split('')
        .map((char, index) => (index > 0 && index % 4 === 0 ? ' ' + char : char))
        .join('');

      check(input, name);
    }

    if (name === 'cvc') {
      document.querySelector('#cvc')!.innerHTML = (inputValue + '000').substring(0, 3);

      check(input, name);
    }

    if (name === 'month' || name === 'year') {
      document.querySelector(`#${name}`)!.innerHTML = ('00' + inputValue).slice(-2);

      check(input, 'date');
    }
  };
});

function check(input: HTMLInputElement, name: string): Promise<boolean> {
  const hasError = !input.checkValidity();
  const errorEl = document.querySelector(`label[data-for='${name}'] .error`);

  if (hasError) {
    if (input.validity.valueMissing) {
      errorEl!.innerHTML = "Can't be empty";
    }

    if (input.validity.patternMismatch) {
      errorEl!.innerHTML = input.dataset.error || 'Pattern mismatch';
    }

    if (input.validity.tooShort) {
      errorEl!.innerHTML = 'Insufficient length';
    }

    if (input.validity.rangeOverflow || input.validity.rangeUnderflow) {
      errorEl!.innerHTML = 'Invalid value';
    }

    input.classList.add('has-error');
  } else {
    input.classList.remove('has-error');
  }

  return new Promise((resolve) => resolve(!hasError));
}

formEl?.addEventListener('submit', (ev: any) => {
  ev.preventDefault();

  let valid = true;

  inputEls.forEach(async (input) => {
    valid =
      valid &&
      (await check(input, input.name === 'month' || input.name === 'year' ? 'date' : input.name));
  });

  if (valid) {
    formEl.classList.add('completed');
    console.log(Object.fromEntries(new FormData(formEl) as any));
  }
});
