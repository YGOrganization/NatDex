import { resolveImage } from './resolveImage.js';
import { getColorForCard } from './colourrule.js';

export function renderCardBlock(entry, isAdmin = false) {
  const block = document.createElement('div');
  block.className = 'card-block';

  const idRow = document.createElement('div');
  idRow.className = 'card-row card-row-id';
  idRow.textContent = entry.id;
  block.appendChild(idRow);

  const imageRow = document.createElement('div');
  imageRow.className = 'card-row card-row-image';
  imageRow.style.setProperty('--card-color', getColorForCard(entry));

  const img = resolveImage(entry);
  if (img) {
    imageRow.appendChild(img);
  }

  block.appendChild(imageRow);

  const nameRow = document.createElement('div');
  nameRow.className = 'card-row card-row-name';
  nameRow.textContent = entry.name;
  block.appendChild(nameRow);

  return block;
}

export function renderCardGrid(data, container, isAdmin = false) {
  container.innerHTML = '';
  for (const entry of data) {
    const block = renderCardBlock(entry, isAdmin);
    container.appendChild(block);
  }
}
