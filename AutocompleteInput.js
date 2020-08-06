//* Try to make constructor arguments an object, look up in learn.javascript.ru
//* Pass all CSS classes you use to create elements in constructor
//TODO: Think what this class should do overall
//TODO: Think about syncing this with words highlighting in text
class AutocompleteInput {
  #inputElement;
  #matchesElement;
  wordsToMatch;
  accurateMatchItemClass;
  inaccurateMatchItemClass;
  activeMatchItemClass;


  constructor({
    inputElement, 
    wordsToMatch = [], 
    accurateClass: accurateMatchItemClass = 'accurate', 
    inaccurateClassClass: inaccurateMatchItemClass = 'inaccurate',
    activeClass: activeMatchItemClass = 'active',
  } = {}) {
    this.#inputElement = inputElement;
    this.wordsToMatch = [...new Set( wordsToMatch.map(word => word.toLowerCase()) )];

    this.inaccurateMatchItemClass = inaccurateMatchItemClass;
    this.accurateMatchItemClass = accurateMatchItemClass;
    this.activeMatchItemClass = activeMatchItemClass;

    this.#createMatchesElement();
    this.#setInputEventListeners();
  }


  #createMatchesElement() {
    if ( !document.getElementById(this.#inputElement.dataset.list_id) ) {
      this.#matchesElement = document.createElement('ul');
      if (this.#inputElement.dataset.list_id)
        this.#matchesElement.setAttribute('id', this.#inputElement.dataset.list_id);
      else
        this.#matchesElement.setAttribute('id', `${this.#inputElement.getAttribute('id')}__matches`);
    
      // Appends $match element after $this.#inputElement element inside of <div> container
      const container = document.createElement('div');
      container.style.position = 'relative';
      this.#inputElement.parentNode.insertBefore(container, this.#inputElement);
      
      this.#inputElement.remove();
      container.append(this.#inputElement, this.#matchesElement);
    } else {
      this.#matchesElement = document.getElementById(this.#inputElement.dataset.list_id);
    }
  }


  #setInputEventListeners() {
    document.addEventListener('click', e => {
      this.removeMatchesList();

      if (e.target === this.#inputElement && this.#inputElement.value.length > 2) 
        this.displayMatchingWords( this.getMatchingWords() );
    });
  
    this.#inputElement.addEventListener('keydown', e => { this.#arrowShift(e) });
  
    this.#inputElement.addEventListener('keyup', e => {
      if (e.keyCode === 38 || e.keyCode === 40) return;
  
      if (e.keyCode === 13 && this.#matchesElement.childElementCount > 0) {
        this.#inputElement.value = this.#matchesElement
          .querySelector(`.${this.activeMatchItemClass}`).textContent;

        this.removeMatchesList();
        return;
      }
      
      this.removeMatchesList();
  
      if (this.#inputElement.value.length > 2)
        this.displayMatchingWords( this.getMatchingWords() );
    });
  }


  getMatchingWords() {
    const strEscape = str => str.replace(/\\/g, '\\\\');

    let inaccuratePattern = new RegExp(
      `[a-zа-я-]+${strEscape( this.#inputElement.value.toLowerCase() )}[a-zа-я-]*`, 
      'gi'
    );
    let matches = {};
  
    if (this.wordsToMatch.length > 0) {
      matches.accurate = this.wordsToMatch.filter( 
        item => item.toLowerCase().startsWith( this.#inputElement.value.toLowerCase() ) 
      );

      matches.inaccurate = this.wordsToMatch.filter( item => item.toLowerCase().match(inaccuratePattern) );
    }
  
    return matches;  // {inaccurate: [string:'word', ...], accurate: [string:'word', ...]}
  }


  displayMatchingWords(words) {
    const accurateItems = this.#getListElementsFromWords(words.accurate, this.accurateMatchItemClass, true);
    const inaccurateItems = this.#getListElementsFromWords(words.inaccurate, this.inaccurateMatchItemClass);
  
    if ([...accurateItems, ...inaccurateItems].length > 0) {
      this.#matchesElement.append(...accurateItems, ...inaccurateItems);
      this.#matchesElement.firstElementChild.classList.add('active');
    }
  }


  #getListElementsFromWords(words, style, accurate = false) {
    return words.map(word => {
      const li = document.createElement('li');
      // console.log(word);
  
      if (!accurate) {
        let matchStartIndex = word.indexOf( this.#inputElement.value.toLowerCase() );
        let matchEndIndex = matchStartIndex + this.#inputElement.value.length;

        let beforeMatch = word.slice(0, matchStartIndex);
        let match = word.slice(matchStartIndex, matchEndIndex);
        let afterMatch = word.slice(matchEndIndex, word.length);
  
        li.innerHTML = `${beforeMatch}<span class="${style}">${match}</span>${afterMatch}`;
      } else {
        let match = word.slice(0, this.#inputElement.value.length);
        let afterMatch = word.slice(match.length, word.length);
  
        li.innerHTML = `<span class="${style}">${match}</span>${afterMatch}`;
      }
  
      li.onclick = e => {
        this.#inputElement.value = li.textContent;
        this.removeMatchesList();
      };
  
      li.onmouseover = e => {
        const active = this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`);
        if (active) active.classList.remove(this.activeMatchItemClass);

        li.classList.add(this.activeMatchItemClass);
      };
  
      return li;
    });
  }


  removeMatchesList() {
    if (this.#matchesElement.childElementCount > 0)
      Array.from(this.#matchesElement.children).forEach(child => child.remove());
  }


  #arrowShift(e) {
    if (e.keyCode === 40 && this.#matchesElement.childElementCount > 0) {
      e.preventDefault();
      if (
        this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`) === this.#matchesElement.lastElementChild
      ) return;
      else if ( !this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`) )
        this.#matchesElement.firstElementChild.classList.add(this.activeMatchItemClass);
      else {
        const active = this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`);
        active.classList.remove(this.activeMatchItemClass);
  
        active.nextElementSibling.classList.add(this.activeMatchItemClass);
      }
    }
  
    if (e.keyCode === 38 && this.#matchesElement.childElementCount > 0) {
      e.preventDefault();
  
      if ( 
        !this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`) || 
        this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`) === this.#matchesElement.firstElementChild 
      ) return;
      else {
        const active = this.#matchesElement.querySelector(`.${this.activeMatchItemClass}`);
        active.classList.remove(this.activeMatchItemClass);
  
        active.previousElementSibling.classList.add(this.activeMatchItemClass);
      }
    }
  }
}