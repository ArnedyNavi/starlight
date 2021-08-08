String.prototype.remove = function(index) {
    return this.substr(0, index) + this.substr(index + 1);
}


const card = document.querySelector(".card__inner");
let status = 0;
card.addEventListener("click", function (e) {
  card.classList.toggle('is-flipped');
  if (status == 0) {
      status = 1;
  }
  else {
      status = 0;
  }
});

let words;
let last;
function passData(data, init) {
    data = data.remove(0);
    data = data.remove(data.length - 1);

    words = JSON.parse(data);
    last = parseInt(init);
    initData();
}

function initData() {
    let number_now = '<font color="#fd956b"><span style="font-weight: bolder; color:#ff6e1e">' + last + '</span>/' + words.length + '</font>';
    
    document.getElementById('hanzi').innerHTML = words[last-1].hanzi;
    document.getElementById('pinyin').innerHTML = words[last-1].pinyin;
    document.getElementById('meaning').innerHTML = words[last-1].meaning;
    document.getElementById('number').innerHTML = number_now;

    if (last - 1 == words.length - 1) {
        document.getElementById('btn-next').disabled = true;
    }
    else {
        document.getElementById('btn-next').disabled = false;
    }
    
    if (last - 1 == 0) {
        document.getElementById('btn-back').disabled = true;
    }
    else {
        document.getElementById('btn-back').disabled = false;
    }

}


function nextCard() {
    if (status == 1) {
        card.classList.toggle('is-flipped');
        status = 0;
    }
    last += 1;

    let number_now = '<font color="#fd956b"><span style="font-weight: bolder; color:#ff6e1e">' + last + '</span>/' + words.length + '</font>';
    setTimeout(function() {
        document.getElementById('hanzi').innerHTML = words[last-1].hanzi;
        document.getElementById('pinyin').innerHTML = words[last-1].pinyin;
        document.getElementById('meaning').innerHTML = words[last-1].meaning;
        document.getElementById('number').innerHTML = number_now;
    }, 250)

    if (last - 1 == words.length - 1) {
        document.getElementById('btn-next').disabled = true;
    }
    else {
        document.getElementById('btn-next').disabled = false;
    }
    
    if (last - 1 == 0) {
        document.getElementById('btn-back').disabled = true;
    }
    else {
        document.getElementById('btn-back').disabled = false;
    }
}


function beforeCard() {
    if (status == 1) {
        card.classList.toggle('is-flipped');
        status = 0;
    }
    last -= 1;

    let number_now = '<font color="#fd956b"><span style="font-weight: bolder; color:#ff6e1e">' + last + '</span>/' + words.length + '</font>';
    
    setTimeout(function() {
        document.getElementById('hanzi').innerHTML = words[last-1].hanzi;
        document.getElementById('pinyin').innerHTML = words[last-1].pinyin;
        document.getElementById('meaning').innerHTML = words[last-1].meaning;
        document.getElementById('number').innerHTML = number_now;
    }, 250)

    if (last - 1 == words.length - 1) {
        document.getElementById('btn-next').disabled = true;
    }
    else {
        document.getElementById('btn-next').disabled = false;
    }
    
    if (last - 1 == 0) {
        document.getElementById('btn-back').disabled = true;
    }
    else {
        document.getElementById('btn-back').disabled = false;
    }
}

function saveProgress() {
    let url = window.location.pathname + '/save';
    $.ajax({
        type : "POST",
        url : url,
        data : {"data": last},
    })
}