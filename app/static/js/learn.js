String.prototype.remove = function(index) {
    return this.substr(0, index) + this.substr(index + 1);
}

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
       j = Math.floor( Math.random() * ( i + 1 ) );
       temp = this[i];
       this[i] = this[j];
       this[j] = temp;
    }
    return this;
}

let words;
let last;
let real_last;
let level_now;
let word_status;
let total_words;
let progress;
let quiz_count = 0;
let quiz_count_2 = 0;

function passData(data, init, status, level) {
    data = data.remove(0);
    data = data.remove(data.length - 1);

    words = JSON.parse(data);
    real_last = parseInt(init);
    word_status = JSON.parse(status);
    level_now = parseInt(level);
    findLevelNow();
    findTotalLevel();
    initData();
}

function findLevelNow() {
    if ((level_now * 25) < real_last || real_last % 25 == 0) {
        last = ((level_now - 1) * 25) + 1;
    }
    else {
        last = real_last;
    }
}

function findTotalLevel() {
    if (level_now < (Math.round(words.length/25))) {
        total_words = 25;
    }
    else {
        total_words = words.length - ((level_now-1) * 25);
    }
}

function initData() {
    let number = last + '/' + words.length; 
    let accuracy_html = getAccuracyHTML();

    document.getElementById('number').innerHTML = number;
    document.getElementById('hanzi').innerHTML = words[last - 1].hanzi;
    document.getElementById('pinyin').innerHTML = words[last - 1].pinyin;
    document.getElementById('meaning').innerHTML = words[last - 1].meaning;
    document.getElementById('accuracy').innerHTML = accuracy_html;

    let width;
    if (total_words == 25) {
        width = ((last % 25) / total_words * 100);
        if (width == 0) {
            width = 25 * 4;
        }
    }
    else {
        width = (total_words - ((words.length - last))) / total_words * 100;
    }

    progress = width;
    var id = setInterval(function() {
        if (parseInt(document.getElementById('bar').style.width.slice(0,-1)) < width) {
            width_now = parseInt(document.getElementById('bar').style.width.slice(0,-1))
            width_now++;
            document.getElementById('bar').style.width = width_now + '%';
        }
        else {
            clearInterval(id);
        }
    }, 25)
}

function nextWord() {
    if (quiz_count % 3 != 0 || last <= 5) {
    //if (quiz_count != 1) {
        document.getElementById('card-container').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('accuracy-row').style.display = 'block';
        

        last += 1;
        let number = last + '/' + words.length; 
        let accuracy_html = getAccuracyHTML();
        document.getElementById('number').innerHTML = number;
        document.getElementById('hanzi').innerHTML = words[last - 1].hanzi;
        document.getElementById('pinyin').innerHTML = words[last - 1].pinyin;
        document.getElementById('meaning').innerHTML = words[last - 1].meaning;
        document.getElementById('accuracy').innerHTML = accuracy_html;
        quiz_count += 1;
        
        let width;
        if (total_words == 25) {
            width = ((last % 25) / total_words * 100);
            if (width == 0) {
                width = 25 * 4;
            }
        }
        else {
            width = (total_words - ((words.length - last))) / total_words * 100;
        }

        progress = width;
        var id = setInterval(function() {
            if (parseInt(document.getElementById('bar').style.width.slice(0,-1)) < width) {
                width_now = parseInt(document.getElementById('bar').style.width.slice(0,-1))
                width_now++;
                document.getElementById('bar').style.width = width_now + '%';
            }
            else {
                clearInterval(id);
            }
        }, 25)
    }

    else {
        quiz_count_2 += 1;

        if (quiz_count_2 == 4) {
            quiz_count_2 = 0;
            quiz_count = 1;
        } 
        for (let i = 1; i < 5; i++ ){
            document.getElementById(i).disabled = false;
            document.getElementById(i).className = 'btn btn-mini-quiz';
        }
        
        document.getElementById('card-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('accuracy-row').style.display = 'none';

        document.getElementById('btn-next').style.display = 'none';
        document.getElementById('btn-next-quiz').style.display = 'block';

        initQuiz()
    }
    if (progress == 100) {
        document.getElementById('btn-next').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'block';
    }
}

function getAccuracyHTML() {
    let accuracy = word_status[last - 1];
    let accuracy_html;

    if (accuracy <= 30) {
        accuracy_html = '<font style="color: #ff3953">' + accuracy + '%</font>';
    }

    else if (accuracy <= 50 && accuracy > 30) {
        accuracy_html = '<font style="color: #ffbb00">' + accuracy + '%</font>';
    }

    else {
        accuracy_html = '<font style="color: #0F9D58">' + accuracy + '%</font>';
    }
    return accuracy_html;
}

let questions;
let answers;
let index_correct;
let question_types = [{q: 'hanzi', a: 'pinyin'}, {q: 'hanzi', a: 'meaning'}, {q: 'meaning', a: 'hanzi'}, {q: 'meaning', a: 'pinyin'}, {q: 'pinyin', a: 'hanzi'}]

function initQuiz() {
    let type_random = question_types[Math.floor(Math.random() * question_types.length)];
    let questions = [words[last - 1], words[last - 2], words[last - 3], words[last - 4], words[last - 5]];
    let question_index = Math.floor(Math.random() * questions.length);
    let question;

    if (type_random.q == 'hanzi' || type_random.q == 'pinyin') {
        document.getElementById('question-mini-quiz').className = 'question question-hanzi mb-5';
        if (type_random.q == 'hanzi') {
            question = questions[question_index].hanzi;
        }
        else {
            question = questions[question_index].pinyin;
        }
    }
    else {
        document.getElementById('question-mini-quiz').className = 'question question-meaning mb-5';
        question = questions[question_index].meaning;
    }

    answers_random = [questions[question_index]];
    for (let i = 0; i < 3; i++) {
        let answer_index;
        do {
            answer_index = Math.floor(Math.random() * words.length);
        }
        while (words[answer_index] in answers_random);
        answers_random.push(words[answer_index]);
    }

    let answers;
    if (type_random.a == 'hanzi' || type_random.a == 'pinyin') {
        document.getElementById('options').className = 'row row-cols-lg-2 row-cols-1 text-center d-flex flex-row align-items-center';
        if (type_random.a == 'hanzi') {
            answers = [answers_random[0].hanzi, answers_random[1].hanzi, answers_random[2].hanzi, answers_random[3].hanzi];
            
            for (let j = 0; j < 4; j++) {
                if (type_random.a == 'hanzi') {
                    document.getElementsByClassName('btn-mini-quiz')[j].style.fontSize = '25px';
                }
                else {
                    document.getElementsByClassName('btn-mini-quiz')[j].style.fontSize = '18px';
                }
            }
        }
        else {
            answers = [answers_random[0].pinyin, answers_random[1].pinyin, answers_random[2].pinyin, answers_random[3].pinyin];
            for (let j = 0; j < 4; j++) {
                document.getElementsByClassName('btn-mini-quiz')[j].style.fontSize = '18px';
            }
        }
    }
    else {
        for (let j = 0; j < 4; j++) {
            document.getElementsByClassName('btn-mini-quiz')[j].style.fontSize = '18px';
        }
        document.getElementById('options').className = 'row row-cols-lg-1 row-cols-1 text-center d-flex flex-row align-items-center';
        answers = [answers_random[0].meaning, answers_random[1].meaning, answers_random[2].meaning, answers_random[3].meaning];
    }

    let correct_answer = answers[0];
    answers = answers.shuffle();
    
    index_correct = answers.indexOf(correct_answer) + 1;

    document.getElementById('question-mini-quiz').innerHTML = question;
    document.getElementById('1').innerHTML = answers[0];
    document.getElementById('2').innerHTML = answers[1];
    document.getElementById('3').innerHTML = answers[2];
    document.getElementById('4').innerHTML = answers[3];
}

function chosenOption(option) {
    document.getElementById('1').disabled = 'True';
    document.getElementById('2').disabled = 'True';
    document.getElementById('3').disabled = 'True';
    document.getElementById('4').disabled = 'True';

    if (option == index_correct) {
        document.getElementById(option).className = 'btn btn-mini-quiz-correct';
    }

    else {
        document.getElementById(option).className = 'btn btn-mini-quiz-wrong';
        document.getElementById(index_correct).className = 'btn btn-mini-quiz-correct';
    }

    document.getElementById('btn-next').style.display = 'block';
    document.getElementById('btn-next-quiz').style.display = 'none';
}

function skipQuiz() {
    document.getElementById('1').disabled = 'True';
    document.getElementById('2').disabled = 'True';
    document.getElementById('3').disabled = 'True';
    document.getElementById('4').disabled = 'True';

    document.getElementById(index_correct).className = 'btn btn-mini-quiz-correct';

    document.getElementById('btn-next').style.display = 'block';
    document.getElementById('btn-next-quiz').style.display = 'none';
}

let questions_quiz = []
let number_now = 1;
function getQuestion() {
    question_index = (((level_now - 1) * 25) - 1)
    for (let i = 0; i < total_words; i++) {
        question_index += 1;
        questions_quiz.push(words[question_index]);
    }
}

function Quiz() {
    document.getElementById('container-learn').style.display = 'none';
    document.getElementById('container-quiz').style.display = 'block';

    getQuestion();
    initUnitQuiz();
}

function initUnitQuiz() {
    document.getElementById('btn-next-unit-quiz').disabled = 'True';
    let type_random = question_types[Math.floor(Math.random() * question_types.length)];
    let question_index = Math.floor(Math.random() * questions_quiz.length);
    let question;

    if (type_random.q == 'hanzi' || type_random.q == 'pinyin') {
        document.getElementById('question-quiz').className = 'question question-hanzi mb-5';
        if (type_random.q == 'hanzi') {
            question = questions_quiz[number_now - 1].hanzi;
        }
        else {
            question = questions_quiz[number_now - 1].pinyin;
        }
    }
    else {
        document.getElementById('question-quiz').className = 'question question-meaning mb-5';
        question = questions_quiz[number_now - 1].meaning;
    }

    answers_random = [questions_quiz[number_now - 1]];
    for (let i = 0; i < 3; i++) {
        let answer_index;
        do {
            answer_index = Math.floor(Math.random() * words.length);
        }
        while (words[answer_index] in answers_random);
        answers_random.push(words[answer_index]);
    }

    let answers;
    console.log(document.getElementsByClassName('btn-option-quiz')[0]);
    if (type_random.a == 'hanzi' || type_random.a == 'pinyin') {
        document.getElementById('options-quiz').className = 'row row-cols-lg-2 row-cols-1 text-center d-flex flex-row align-items-center';
        if (type_random.a == 'hanzi') {
            answers = [answers_random[0].hanzi, answers_random[1].hanzi, answers_random[2].hanzi, answers_random[3].hanzi];
            
            for (let j = 0; j < 4; j++) {
                if (type_random.a == 'hanzi') {
                    document.getElementsByClassName('btn-option-quiz')[j].style.fontSize = '25px';
                }
                else {
                    document.getElementsByClassName('btn-option-quiz')[j].style.fontSize = '18px';
                }
            }
        }
        else {
            answers = [answers_random[0].pinyin, answers_random[1].pinyin, answers_random[2].pinyin, answers_random[3].pinyin];
            for (let j = 0; j < 4; j++) {
                document.getElementsByClassName('btn-option-quiz')[j].style.fontSize = '18px';
            }
        }
    }
    else {
        for (let j = 0; j < 4; j++) {
            document.getElementsByClassName('btn-option-quiz')[j].style.fontSize = '18px';
        }
        document.getElementById('options-quiz').className = 'row row-cols-lg-1 row-cols-1 text-center d-flex flex-row align-items-center';
        answers = [answers_random[0].meaning, answers_random[1].meaning, answers_random[2].meaning, answers_random[3].meaning];
    }

    let correct_answer = answers[0];
    answers = answers.shuffle();
    
    index_correct = answers.indexOf(correct_answer) + 1;

    document.getElementById('question-quiz').innerHTML = question;

    for (let i = 0; i < 4; i++) {
        document.getElementById('quiz-' + (i+1)).innerHTML = answers[i];
        document.getElementById('quiz-' + (i+1)).disabled = false;
        document.getElementById('quiz-' + (i+1)).className = 'btn btn-mini-quiz btn-option-quiz';
    }

    if (number_now >= total_words) {
        document.getElementById('btn-next-unit-quiz').innerHTML = '<i class="fa fa-paper-plane"></i> Submit';
    }
}


let checked_answers = [];
function checkQuizOption(answer, option) {
    let status;
    document.getElementById('btn-next-unit-quiz').disabled = false;

    for (let i = 0; i < 4; i++) {
        document.getElementById('quiz-' + (i+1)).disabled = 'True';
    }

    if (answer == index_correct) {
        document.getElementById(option).className = 'btn btn-mini-quiz-correct btn-option-quiz';
        status = 1;
    }

    else {
        status = 0;
        document.getElementById(option).className = 'btn btn-mini-quiz-wrong btn-option-quiz';
        document.getElementById('quiz-'+index_correct).className = 'btn btn-mini-quiz-correct btn-option-quiz';
    }

    let id_question = questions_quiz[number_now - 1].id;
    let checked = {
        id: id_question,
        status: status,
        number: number_now,
    }
    checked_answers.push(checked);
}

function nextQuestion() {
    if (number_now < total_words) {
        number_now += 1;
        initUnitQuiz();
    }
    else {
        saveAnswer();
    }
}

function saveAnswer() {
    let url = window.location.pathname + '/submit';
    $.ajax({
        type : "POST",
        url : url,
        data : {"data": JSON.stringify(checked_answers)},
        success: function(response){
            window.location.href = '/course/' + deck_id + '/learn';
        }
    });
}

function QuitLearn() {
    if (last <= real_last) {
        window.location.href = '/course/' + deck_id + '/learn' ;
    } 
    else {
        let url = window.location.pathname + '/save';
        $.ajax({
            type : "POST",
            url : url,
            data : {"data": JSON.stringify(last)},
            success: function(response){
                window.location.href = '/course/' + deck_id + '/learn';
            }
        });
    }
}