let quiz_type;

function openQuizPopUp() {
    document.getElementById('quiz_popup').style.display = 'block';
}

function closeQuizPopUp() {
    document.getElementById('quiz_popup').style.display = 'none';
}

function quizTypeButton(type) {
    quiz_type=type;

    if (type == 'hanzi') {
        document.getElementById('btn-quiz-hanzi').className= 'btn btn-primary btn-quiz';
        document.getElementById('btn-quiz-pinyin').className= 'btn btn-outline-dark btn-quiz';
        document.getElementById('btn-quiz-meaning').className= 'btn btn-outline-danger btn-quiz';
    }

    else if (type == 'pinyin') {
        document.getElementById('btn-quiz-hanzi').className= 'btn btn-outline-primary btn-quiz';
        document.getElementById('btn-quiz-pinyin').className= 'btn btn-dark btn-quiz';
        document.getElementById('btn-quiz-meaning').className= 'btn btn-outline-danger btn-quiz';
    }

    else if (type == 'meaning') {
        document.getElementById('btn-quiz-hanzi').className= 'btn btn-outline-primary btn-quiz';
        document.getElementById('btn-quiz-pinyin').className= 'btn btn-outline-dark btn-quiz';
        document.getElementById('btn-quiz-meaning').className= 'btn btn-danger btn-quiz';
    }

    document.getElementById('quiz_type').value = type;
}

function modifyMinMax() {
    let minimum_of_max = parseInt(document.getElementById('start_number').value) + 30;
    let maximum_of_min = parseInt(document.getElementById('finish_number').value) - 30;

    document.getElementById('start_number').max = maximum_of_min;
    document.getElementById('finish_number').min = minimum_of_max;
}
