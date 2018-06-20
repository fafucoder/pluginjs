import { parseHTML } from '@pluginjs/dom'

export default () => parseHTML`
    <div class="dropdown-wrap">
        <div class="dropdown-example">click me</div>
        <ul>
            <li data-value="1">items-1</li>
            <li data-value="2">items-2</li>
            <li data-value="3">items-3</li>
            <li data-value="4">items-4</li>
        </ul>
    </div>
`
