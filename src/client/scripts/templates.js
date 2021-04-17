export const messageTemplate = `
    <li class="text-left list-group-item {{type}} alt-{{me}}">
        <span class="prefix">{{prefix}}</span>
        {{#if username}}
            {{#if me}}
                <strong class="username">you</strong>
            {{/if}}
            {{#unless me}}
                <strong class="username">
                    {{#ifEquals type "info"}}#{{/ifEquals}}{{username}}
                </strong>
            {{/unless}}
        {{/if}}
        <small class="date">{{date}}</small>
        {{#if content}}
            <span class="content"> : {{message}}<span>
        {{/if}}
    </li>`;