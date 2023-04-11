export default class Tickets {
  constructor() {
    this.ticketsList = document.querySelector('.tickets-list');

    this.init();
    this.events();
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

    // добавление тикета
    this.createModalEvents();

    // обновление тикета
    this.updateModalEvents();

    // удаление тикета
    this.removeModalEvents();

    // клик по тикету
    this.ticketsList.addEventListener('click', e => {

      const ticket = e.target.closest('.ticket');
      this.activeTicketId = ticket.dataset.id;

      // выполнить тикет
      if (e.target.classList.contains('ticket_status')) {
        this.doneTicket();
        this.init();
        return;
      }

      // удалить тикет
      if (e.target.classList.contains('ticket_remove')) {
        this.removeModal.classList.add('active');
        return;
      }

      // редактировать тикет
      if (e.target.classList.contains('ticket_update')) {
        this.updateModalData();
        this.updateModal.classList.add('active');
        return;
      }
      
      // показать описание
      this.showFull(ticket);
    }) 

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

  createModalEvents() {
    
    this.createModal = document.querySelector('.modal-add');

    // открытие модалки добавления тикета
    const addBtn = document.querySelector('.tickets-add-btn');
    addBtn.addEventListener('click', () => {
      this.createModal.classList.add('active');
    })

    this.createModalForm = this.createModal.querySelector('.add-form');

    this.createModalCancel = this.createModal.querySelector('.cancel-btn');
    this.createModalCancel.addEventListener('click', (e) => {
      e.preventDefault();
      this.createModalForm.reset();
      this.createModal.classList.remove('active');
    })

    this.createModalOk = this.createModal.querySelector('.ok-btn');
    this.createModalOk.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const data = new FormData(this.createModalForm);

      const body = Array.from(data)
        .map(item => `${item[0]}=${item[1]}`)
        .join('&');

      const url = 'http://localhost:7070/?method=createTicket';

      await this.xhr(url, body);

      this.createModalForm.reset();
      this.createModal.classList.remove('active');
      this.init();

    })

  }

  updateModalEvents() {
    this.updateModal = document.querySelector('.modal-update');
    this.updateModalForm = this.updateModal.querySelector('.update-form');
    this.updateModalFormName = this.updateModal.querySelector('.modal-update-name');
    this.updateModalFormDescription = this.updateModal.querySelector('.modal-update-description');

    this.updateModalCancel = this.updateModal.querySelector('.cancel-btn');
    this.updateModalCancel.addEventListener('click', (e) => {
      e.preventDefault();
      this.updateModalForm.reset();
      this.updateModal.classList.remove('active');
    })
    
    this.updateModalOk = this.updateModal.querySelector('.ok-btn');
    this.updateModalOk.addEventListener('click', async (e) => {
      e.preventDefault();

      const data = new FormData(this.updateModalForm);

      const body = 'id='+ this.activeTicketId + '&' + Array.from(data)
        .map(item => `${item[0]}=${item[1]}`)
        .join('&');
      
      const url = 'http://localhost:7070/?method=updateTicket';

      await this.xhr(url, body);

      this.updateModalForm.reset();
      this.updateModal.classList.remove('active');
      this.init();

    })
  }

  updateModalData() {
    const ticket = this.tickets.find(item => item.id == this.activeTicketId);
    this.updateModalFormName.value = ticket.name;
    this.updateModalFormDescription.value = ticket.description;
  }

  async doneTicket() {

    const url = 'http://localhost:7070/?method=doneTicket';
    const body = `id=${this.activeTicketId}`;

    await this.xhr(url, body);

  }

  removeModalEvents() {
    this.removeModal = document.querySelector('.modal-remove');

    this.removeModalCancel = this.removeModal.querySelector('.cancel-btn');
    this.removeModalCancel.addEventListener('click', (e) => {
      e.preventDefault();

      this.removeModal.classList.remove('active');
    })

    this.removeModalOk = this.removeModal.querySelector('.ok-btn');
    this.removeModalOk.addEventListener('click', async (e) => {
      e.preventDefault();

      const url = 'http://localhost:7070/?method=removeTicket';
      const body = `id=${this.activeTicketId}`;

      await this.xhr(url, body);

      this.removeModal.classList.remove('active');
      this.init();

    })

  }

  async showFull(ticket) {

    const content = ticket.querySelector('.ticket_content');
    if (content.dataset.full) {
      return;
    }

    const description = await this.getFull(this.activeTicketId);
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


}