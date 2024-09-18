function enableInputs() {
	const inputs = document.querySelectorAll("input");
	const buttons = document.querySelectorAll("button");

	inputs.forEach((input) => {
		input.disabled = false;
	});

	buttons.forEach((btn) => {
		btn.disabled = false;
	});
}

export default enableInputs;
