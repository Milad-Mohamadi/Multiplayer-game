import './theme/base.scss';
import Handlebars from 'handlebars';
import App from './scripts/app';

window.onload = () => {
    const app = new App();
    app.init();
};

Handlebars.registerHelper('ifEquals', (arg1, arg2, options) =>
    arg1 == arg2 ? options.fn(this) : options.inverse(this)
);