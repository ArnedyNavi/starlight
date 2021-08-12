
let total_level;
let total_words;
let progress;

function passData(p, t) {
    progress = parseInt(p);
    total_words = parseInt(t);
    total_level = Math.ceil(progress/25);
    if (progress % 25 == 0) {
        if (progress != total_words) {
            total_level += 1;
        }
    }
}

function showLevel(level) {
    let width = 1;
    let max_width;
    let level_now;
    if (progress % 25 == 0 && progress != 0) {
        level_now = Math.ceil(progress/25) + 1;
    }
    else {
        level_now = Math.ceil(progress/25);
    }

    if (level_now != level) {
        if (progress != 0) {
            max_width = 100;
        }
        else {
            max_width = 0;
        }
    }
    else {
        max_width = (progress - (25 * (Math.floor(progress/25)))) / 25 * 100;
    }
    var id = setInterval(function(){
        if (width > max_width) {
            clearInterval(id)
        }
        else {
            width++
            let id_level = 'level-' + level
            document.getElementById(id_level).style.backgroundColor = '#fd956b';
            document.getElementById(id_level).style.width = width + '%';
        }
    }, 5);
    return 'success';
}

function showLevels() {
    for (let i = 1; i <= total_level; i++) {
        let id_card_level = 'card-' + i;
        document.getElementById(id_card_level).className = 'levels-on' ;
        showLevel(i);
    }
}