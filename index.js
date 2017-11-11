/** @jsx h */

// $ - node DOM, node - virtual DOM

const h = (elementName, attributes, ...children) => {
  return {elementName, attributes: attributes || {}, children}
}

const setBooleanProp = ($target, key, value) => { 
  if (value) { 
    $target.setAttribute(key, value); 
    $target[key] = true;
  } else { 
    $target[key] = false;
  }
}

const removeBooleanProp = ($target, key) => { 
  $target.removeAttribute(key);
  $target[key] = false;
}

const isEventProp = (key) => { 
  return /^on/.test(key); 
}

const isCustomProp = (key) => { 
  return isEventProp(key) || key === 'forceUpdate';
}

// убираем on в событиях
const extractEventKey = (key) => { 
  return key.slice(2).toLowerCase(); 
}

const addEventListeners = ($target, attributes) => { 
  Object.keys(attributes).forEach(key => { 
    if (isEventProp(key)) { 
      $target.addEventListener( 
        extractEventKey(key), 
        attributes[key] 
      ); 
    } 
  }); 
}

const setProp = ($target, key, value) => {
  if (isCustomProp(key)) { 
    return; 
  } else if (key === 'className') { 
    $target.setAttribute('class', value); 
  } else if (typeof value === 'boolean') { 
    setBooleanProp($target, key, value); 
  } else { 
    $target.setAttribute(key, value);
  }
}

const removeProp = ($target, key, value) => {
  if (isCustomProp(key)) { 
    return;
  } else if (name === 'className') { 
    $target.removeAttribute('class'); 
  } else if (typeof value === 'boolean') { 
    removeBooleanProp($target, key); 
  } else { 
    $target.removeAttribute(key); 
  } 
}

const setProps = ($target, attributes) => { 
  Object.keys(attributes).forEach(key => { 
    setProp($target, key, attributes[key]);
  }); 
}

const updateProp = ($target, key, newVal, oldVal) => {
  // если нет свойства с таким именем на новом узле
  if (!newVal) { 
    removeProp($target, key, oldVal);
  // если нет свойства с таким именем на старом узле
  } else if (!oldVal || newVal !== oldVal) { 
    setProp($target, key, newVal); 
  } 
}

const updateProps = ($target, newProps, oldProps = {}) => { 
  const props = Object.assign({}, newProps, oldProps); 
  Object.keys(props).forEach(key => { 
    updateProp($target, key, newProps[key], oldProps[key]); 
  }); 
}

const createElement = (node) => {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }
  const $el = document.createElement(node.elementName);
  setProps($el, node.attributes);
  addEventListeners($el, node.attributes); 
  node.children
    .map(createElement)
    .forEach($el.appendChild.bind($el));
  return $el;
}

const changed = (node1, node2) => {
  return typeof node1 !== typeof node2 ||
         typeof node1 === 'string' && node1 !== node2 ||
         node1.elementName !== node2.elementName ||
         node1.attributes && node1.attributes.forceUpdate;
}

const updateElement = ($parent, newNode, oldNode, index = 0) => {
  // Если нет старой ноды
  if (!oldNode) {
    $parent.appendChild(
      createElement(newNode)
    );
  // Если нет новой ноды
  } else if (!newNode) {
    $parent.removeChild(
      $parent.childNodes[index]
    )
  // Если нода изменилась
  } else if (changed(newNode, oldNode)) {
    $parent.replaceChild(
      createElement(newNode),
      $parent.childNodes[index]
    );
  } else if (newNode.elementName) {
    // Обновление атрибутов
    updateProps( 
      $parent.childNodes[index], 
      newNode.attributes, 
      oldNode.attributes 
    );
    // Сравнение дочерних элементов
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = 0; i < newLength || i < oldLength; i++) {
      updateElement(
        $parent.childNodes[index],
        newNode.children[i],
        oldNode.children[i],
        i
      );
    }
  }
}

function log(e) {
  console.log(e.target.value);
}

const f = (
  <ul style="list-style: none;">
    <li className="item" onClick={() => alert('hi!')}>item 1</li>
    <li className="item">
      <input type="checkbox" checked={true} />
      <input type="text" onInput={log} />
    </li>
    {/* this node will always be updated */}
    <li forceUpdate={true}>text</li>
  </ul>
);

const g = (
  <ul style="list-style: none;">
    <li className="item item2" onClick={() => alert('hi!')}>item 1</li>
    <li style="background: red;">
      <input type="checkbox" checked={false} />
      <input type="text" onInput={log} />
    </li>
    {/* this node will always be updated */}
    <li forceUpdate={true}>text</li>
  </ul>
);


const $root = document.getElementById('root');
const $reload = document.getElementById('reload');

updateElement($root, f);
$reload.addEventListener('click', () => {
  updateElement($root, g, f);
});
console.log(f);
