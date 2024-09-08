import Widget from '../Widget';

export function widgetInit() {
    const container = document.querySelector('.widget');
    const widget = new Widget(container);
    widget.init();
}