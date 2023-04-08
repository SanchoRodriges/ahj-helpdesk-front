export default class Tickets {
  constructor() {
    this.ticketsList = document.querySelector('.tickets-list');

    this.init();
    this.events();
  }

  async showFull(ticket, id) {

    const content = ticket.querySelector('.ticket_content');
    if (content.dataset.full) {
      return;
    }

    const description = await this.getFull(id);
    const div = document.createElement('div');
    div.classList.add('ticket_description');
    div.textContent = description.text;
    
    content.insertAdjacentElement('beforeend', div);

    content.dataset.full = true;

  }

  async getFull(id) {
    return new Promise( (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:7070/?method=ticketById&id=' + id);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.send();
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }

  async init() {
    this.tickets = await this.getTickets();

    let html = '';

    this.tickets.forEach(item => {
      let date = new Date(item.created);
      const mouth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      let showDate = date.getDate() + '.' + mouth[date.getMonth()]  + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
      let status = item.status ? '✔' : '';

      html += `
        <div class="ticket" data-id="${item.id}">
          <div class="ticket_status">${status}</div>
          <div class="ticket_content">
            <div class="ticket_name">${item.name}</div>
          </div>        
          <div class="ticket_created">${showDate}</div>
          <div class="ticket_update">✐</div>
          <div class="ticket_remove">✕</div>
        </div>
      `;
    })
  
    this.ticketsList.innerHTML = html;
  }

  async xhr(url, body) {

    return new Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.send(body); 
      xhr.addEventListener('load', () => {
        if (xhr.status == 200) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      });
    });

  }

  async getTickets() {
    return new Promise( (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:7070/?method=allTickets');
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.send();
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }

  events() {

    // клик по добавлению тикета
    const addBtn = document.querySelector('.tickets-add-btn');
    addBtn.addEventListener('click', () => {
      this.createTicket();
    })

    // клик по тикету
    this.ticketsList.addEventListener('click', e => {

      const ticket = e.target.closest('.ticket');
      const id = ticket.dataset.id;

      // выполнить тикет
      if (e.target.classList.contains('ticket_status')) {
        this.doneTicket(id);
        this.init();
        return;
      }

      // удалить тикет
      if (e.target.classList.contains('ticket_remove')) {
        this.removeTicket(id);
        return;
      }

      // редактировать тикет
      if (e.target.classList.contains('ticket_update')) {
        this.updateTicket(id);
        return;
      }
      
      // показать описание

      console.log(ticket, id);
      
      this.showFull(ticket, id);
    }) 

  }
  
  async createTicket() {
    const addModal = document.querySelector('.modal-add');
    addModal.classList.add('active');

    const form = addModal.querySelector('.add-form');

    const cancelBtn = addModal.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();

      form.reset();
      addModal.classList.remove('active');
    })
    
    const okBtn = addModal.querySelector('.ok-btn');
    okBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const data = new FormData(form);

      const body = Array.from(data)
        .map(item => `${item[0]}=${item[1]}`)
        .join('&');

      const url = 'http://localhost:7070/?method=createTicket';

      await this.xhr(url, body);

      form.reset();
      addModal.classList.remove('active');
      this.init();

    })

  }

  updateTicket(id) {
    const updateModal = document.querySelector('.modal-update');
    updateModal.classList.add('active');

    const form = updateModal.querySelector('.update-form');

    const name = updateModal.querySelector('.modal-update-name');
    const description = updateModal.querySelector('.modal-update-description');

    const ticket = this.tickets.find(item => item.id == id);

    name.value = ticket.name;
    description.value = ticket.description;

    const cancelBtn = updateModal.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();

      form.reset();
      updateModal.classList.remove('active');
    })
    
    const okBtn = updateModal.querySelector('.ok-btn');
    okBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const data = new FormData(form);

      const body = 'id='+ id + '&' + Array.from(data)
        .map(item => `${item[0]}=${item[1]}`)
        .join('&');
      
      const url = 'http://localhost:7070/?method=updateTicket';

      await this.xhr(url, body);

      form.reset();
      updateModal.classList.remove('active');
      this.init();

    })
  }


  async doneTicket(id) {

    const url = 'http://localhost:7070/?method=doneTicket';
    const body = `id=${id}`;

    await this.xhr(url, body);

  }

  removeTicket(id) {

    const removeModal = document.querySelector('.modal-remove');
    removeModal.classList.add('active');

    const cancelBtn = removeModal.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();

      removeModal.classList.remove('active');
    })

    const okBtn = removeModal.querySelector('.ok-btn');
    okBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const url = 'http://localhost:7070/?method=removeTicket';
      const body = `id=${id}`;

      await this.xhr(url, body);

      removeModal.classList.remove('active');
      this.init();

    })

  }

}