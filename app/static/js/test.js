
// Functions
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

function divide(total_number) {
    const ask_hanzi_mc = Math.round(total_number/12 * 3);
    const ask_hanzi_ty = Math.round(total_number/12 * 3);
    const ask_pinyin = Math.round(total_number/12 * 1);
    const ask_tone = Math.round(total_number/12 * 2);
    const ask_meaning = total_number-(ask_hanzi_mc+ask_hanzi_ty+ask_pinyin+ask_tone);
    return [ask_hanzi_mc, ask_hanzi_ty, ask_pinyin, ask_tone, ask_meaning];
}


function randomize_questions(numbers, data) {
    let question_divided = [];
    for (let i = 0; i < numbers.length; i++) {
        let question = [];
        for(let j = 0; j < numbers[i]; j++) {
            index = (Math.floor(Math.random() * data.length));
            question.push(data[index]);
            data.splice(index, 1);
        }
        question_divided.push(question);
    }
    return question_divided;
}

function randomize_options(questions, n, data) {
    q_and_options = [];
    for (let i = 0; i < questions.length; i++) {
        options = [questions[i], -1, -1, -1];
        for (let j = 1; j < n; j++) {
            do {
                option = data[Math.floor(Math.random() * data.length)]
            }
            while(options.includes(option.id))
            options[j] = option;
        }
        q_and_options.push(options);
    }
    return q_and_options;
}

function parse_question(questions, q, a) {
    let questions_set = [];
    let question_set = {};
    for (let i = 0; i < questions.length; i++ ){
        let id = questions[i][0].id;
        let question;
        if (q == "hanzi") {
            question = questions[i][0].hanzi;
        }
        else if (q == "meaning") {
            question = questions[i][0].meaning;
        }
        else {
            question = questions[i][0].pinyin;
        }

        let correct_answer;
        let options = []
        if (a == "hanzi") {
            correct_answer = questions[i][0].hanzi;
            for (let j = 0; j < questions[i].length; j++) {
                let option = questions[i][j].hanzi;
                options.push(option);
            }
        }
        
        else if (a == "meaning") {
            correct_answer = questions[i][0].meaning;
            for (let j = 0; j < questions[i].length; j++) {
                let option = questions[i][j].meaning;
                options.push(option);
            }
        }

        else {
            correct_answer = questions[i][0].pinyin;
            for (let j = 0; j < questions[i].length; j++) {
                let option = questions[i][j].pinyin;
                options.push(option);
            }
        }

        options = options.shuffle();
        question_set = {
            id: id,
            question: question, 
            correct_answer: correct_answer,
            options: options,
            type: "A",
        }
        questions_set.push(question_set);
    }
    return questions_set;
}

function parse_question_hanzi(questions) {
    let questions_set = [];
    let question_set = {};
    for (let i = 0; i < questions.length; i++) {
        let id = questions[i].id;
        let question = questions[i].meaning;
        let correct_answer = questions[i].hanzi;

        question_set = {
            id: id,
            question: question, 
            correct_answer: correct_answer,
            type: "B",
        }

        questions_set.push(question_set);
    }
    return questions_set;
}

function parse_question_tone(questions) {
    let tone = {
        a: ["ā", "á", "ǎ", "à"], 
        i: ["ī", "í", "ǐ", "ì"], 
        u: ["ū", "ú", "ǔ", "ù"], 
        e: ["ē", "é", "ě", "è"], 
        o: ["ō", "ó", "ǒ", "ò"], 
        ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
    };

    let no_tone = ["a", "i", "u", "e", "o", "ü"]

    let questions_set = [];
    for (let i = 0; i < questions.length; i++) {
        let id = questions[i].id;
        let question = questions[i].hanzi;
        let pinyin = (questions[i].pinyin).split(" ");
        
        let correct_answer;
        let info_pinyin;
        for (let j = 0; j < pinyin.length; j++) {
            let p = pinyin[j].slice();
            let info_p = pinyin[j].slice();
            let p_tone = "";
            for (let k = 0; k < no_tone.length; k++) {
                for (let l = 0; l < tone[no_tone[k]].length; l++) {
                    if (p.includes(tone[no_tone[k]][l])) {
                        p_tone = l + 1;
                        p = p.replace(tone[no_tone[k]][l], no_tone[k]);
                        info_p = info_p.replace(tone[no_tone[k]][l], no_tone[k]);
                    }
                }
            }

            p = p.concat(p_tone);
            if (j == 0) {
                correct_answer = p;
                info_pinyin = info_p
            }

            else {
                correct_answer = correct_answer.concat(" ", p);
                info_pinyin = info_pinyin.concat(" ", info_p)
            }
        }

        let question_set = {
            id: id,
            question: question,
            info_pinyin: info_pinyin,
            correct_answer: correct_answer,
            type: "C",
        } 
        questions_set.push(question_set);
    }
    return questions_set;
}

String.prototype.remove = function(index) {
    return this.substr(0, index) + this.substr(index + 1);
}

// Start Program
function questionProcessing (data) {
    data = data.remove(0);
    data = data.remove(data.length - 1);
    
    var parsed = JSON.parse(data);
    var total_number = parsed.length;

    numbers = divide(total_number);

    let q = parsed.slice();
    let questions = randomize_questions(numbers, q);

    let options_0 = randomize_options(questions[0], 4, parsed.slice());
    let q_set_1 = parse_question(options_0, "meaning", "hanzi");

    let q_set_2 = parse_question_hanzi(questions[1], 4, parsed.slice());

    let options_2 = randomize_options(questions[2], 4, parsed.slice());
    let q_set_3 = parse_question(options_2, "meaning", "pinyin");

    let q_set_4 = parse_question_tone(questions[3], 4, parsed.slice());

    let options_4 = randomize_options(questions[4], 4, parsed.slice());
    let q_set_5 = parse_question(options_4, "hanzi", "meaning");

    return [q_set_1, q_set_2, q_set_3, q_set_4, q_set_5];
}

let part_desc = ["Choose the correct hanzi (汉字) for each question", "Type the correct answer (汉字）for every question",
    "Choose the correct pinyin (拼音) for each question", "Type the correct pinyin (拼音) and tone for each question (ex. pin1 yin1)", 
    "Choose the correct meaning for each question"]
   
function showQuestion(part, questions) {
    let question_html = '';

    for (let i = 0; i < questions[part - 1].length; i++) {
        if (questions[part - 1][i].type == "A") {
            question_html = question_html + 
                '<div class="row">' + 
                    '<div class="col-12 question-card my-2">' + 
                        '<div class="row my-2">' + 
                            '<div class="col-1 question-num">' +
                                (i+1) + 
                            '.</div>' +
                            '<div class="col-10 question">' +
                                questions[part - 1][i].question + 
                            '.</div>' +
                        '</div>' +
                        '<div class="row">' + 
                            '<div class="col-md-3 option mt-2">' +
                                '<input type="radio" class="btn-check" name="question-' + (part) + '-' + (i+1) + '" id="option-' + (i+1) + '-1" autocomplete="off" value="' + questions[part - 1][i].options[0] + '">' +
                                '<label class="btn btn-outline-success d-flex flex-row align-self-center align-items-center btn-option-' + (part) + '" for="option-' + (i+1) + '-1">' + questions[part - 1][i].options[0] + '</label>' +
                            '</div>' +
                            '<div class="col-md-3 option mt-2">' +
                                '<input type="radio" class="btn-check" name="question-' + (part) + '-' + (i+1) + '" id="option-' + (i+1) + '-2" autocomplete="off" value="' + questions[part - 1][i].options[1] + '">' +
                                '<label class="btn btn-outline-primary d-flex flex-row align-self-center align-items-center btn-option-' + (part) + '" for="option-' + (i+1) + '-2">' + questions[part - 1][i].options[1] + '</label>' +
                            '</div>' +
                            '<div class="col-md-3 option mt-2">' +
                                '<input type="radio" class="btn-check" name="question-' + (part) + '-' + (i+1) + '" id="option-' + (i+1) + '-3" autocomplete="off" value="' + questions[part - 1][i].options[2] + '">' +
                                '<label class="btn btn-outline-danger d-flex flex-row align-self-center align-items-center btn-option-' + (part) + '" for="option-' + (i+1) + '-3">' + questions[part - 1][i].options[2] + '</label>' +
                            '</div>' +
                            '<div class="col-md-3 option mt-2">' +
                                '<input type="radio" class="btn-check" name="question-' + (part) + '-' + (i+1) + '" id="option-' + (i+1) + '-4" autocomplete="off" value="' + questions[part - 1][i].options[3] + '">' +
                                '<label class="btn btn-outline-dark d-flex flex-row align-self-center align-items-center btn-option-' + (part) + '" for="option-' + (i+1) + '-4">' + questions[part - 1][i].options[3] + '</label>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'                                            
        }
        else if (questions[part - 1][i].type == "B") {
            question_html = question_html + 
                '<div class="row">' + 
                    '<div class="col-12 question-card my-2">' + 
                        '<div class="row my-2">' + 
                            '<div class="col-1 question-num">' +
                                (i+1) + 
                            '.</div>' +
                            '<div class="col-10 question">' +
                                '<div class="row">' +
                                    '<div class="col-10">' +
                                        questions[part - 1][i].question + 
                                    '</div>' + 
                                '</div>' +
                                '<div class="row">' + 
                                    '<div class="col-md-4 option mt-2">' +
                                        '<div class="form-group">' +
                                            '<input type="text" class="form-control form-hanzi" name="question-' + (part) + '-' + (i+1) + '" autocomplete="off">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
        }

        else {
            question_html = question_html + 
                '<div class="row">' + 
                    '<div class="col-12 question-card my-2">' + 
                        '<div class="row my-2">' + 
                            '<div class="col-1 question-num">' +
                                (i+1) + 
                            '.</div>' +
                            '<div class="col-10 question">' +
                                '<div class="row">' +
                                    '<div class="col-10">' +
                                        questions[part - 1][i].question + 
                                    '</div>' + 
                                '</div>' +
                                '<div class="row">' + 
                                    '<div class="col-md-4 option mt-2">' +
                                        '<div class="form-group">' +
                                            '<input type="text" class="form-control form-hanzi" name="question-' + (part) + '-' + (i+1) + '" autocomplete="off">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
        }
    }

    let button_text;

    if (part != 5) {
        button_text = 'Next <i class="fa fa-arrow-right"></i>';

    }
    else {
        button_text = '<i class="fa fa-paper-plane"></i> Submit';
    }

    $("#test").html('<div class="row"><div class="col-12">' +
        '<h3 class="text-center part-text">Part ' + part + '</h3>' + 
        '<h5 class="text-center desc-text">' + part_desc[part - 1] + '</h5>' +
        '</div></div></div>' + question_html + 
        '<div class="row mt-2"><div class="col-12">' +
        '<button class="btn btn-primary btn-next" id="next-' + part + '" onclick="saveAnswer(' + part  + ',' + questions[part - 1].length + ')">' + button_text + '</button>' +
        '</div></div>'
    );
}

let answers = [];
let score = 0;
let score_parts = [];

function saveAnswer(part, total_numbers) {
    let answers_part = [];
    
    for (let i = 1; i <= total_numbers; i++) {
        if (part == 1 || part == 3 || part == 5) {
            let name = 'question-' + part + '-' + i;
            let answers = document.getElementsByName(name);
            
            let answer;
            for(let j = 0; j < answers.length; j++) {
                if(answers[j].checked) {
                    answer = answers[j].value;
                }
            }
            answers_part.push(answer);
        }

        else if (part == 2) {
            let name = 'question-' + part + '-' + i;
            let answer = document.getElementsByName(name)[0].value;
            answers_part.push(answer);
        }

        else if (part == 4) {
            let name = 'question-' + part + '-' + i;
            let answer = document.getElementsByName(name)[0].value;
            answers_part.push(answer);
        }
    }
    answers.push(answers_part)
}

function confirmPopUp() {
    document.getElementById('confirm_popup').style.display = 'block';
}

function closeConfirmPopUp() {
    document.getElementById('confirm_popup').style.display = 'none';
}

function submitAnswer() {
    let checked_answers = []
    let correct = 0;
    let total = 0;
    for (let i = 0; i < answers.length; i++) {
        let total_part = 0;
        let correct_part = 0;
        for (let j = 0; j < answers[i].length; j++) {
            total_part += 1;
            total += 1;
            let correct_answer = questions[i][j].correct_answer;
            let id = questions[i][j].id;
            let answer = answers[i][j];
            let status = 0;

            if (answer == correct_answer) {
                status = 1;
                correct += 1;
                correct_part += 1;
            }
            let checked = {
                id: id, 
                status: status,
            }
            checked_answers.push(checked);
        }
        score_parts.push({
            'correct': correct_part,
            'total' : total_part,
        })
    }
    score = Math.round(correct/total * 100);
    
    let url = window.location.pathname + '/submit';
    $.ajax({
        type : "POST",
        url : url,
        data : {"data": JSON.stringify(checked_answers)},
        success: function(response){
            closeConfirmPopUp();
            finishTest(checked_answers);
        }
    });
}

function startTest(questions) {

    showQuestion(1, questions);
    $('#next-1').click(function() {
        window.scrollTo(0, 0);
        showQuestion(2, questions);

        $('#next-2').click(function() {
            window.scrollTo(0, 0);
            showQuestion(3, questions);

            $('#next-3').click(function() {
                window.scrollTo(0, 0);
                showQuestion(4, questions);
                  
                $('#next-4').click(function() {
                    window.scrollTo(0, 0);
                    showQuestion(5, questions);

                    $('#next-5').click(function() {
                        confirmPopUp();
                    });
                });
            });
        });
    });
}

function finishTest() {
    let detail_score = '';
    let detail_part = ['Part 1: Identifying Hanzi of English words (Vocabulary)', 'Part 2: Identifying Hanzi of English words by typing (Writing)',
        'Part 3: Identifying Pinyin from Hanzi (Vocabulary)', 'Part 4: Identifying Tone and Pinyin from Hanzi (Speaking)', 'Part 5: Identifying Meaning of Hanzi (Reading)'];
    
    let score_color;
    let prompt;
    let score_parts_color;

    if (score <= 30) {
        score_color = '#ff3953';
        prompt = 'Learn and Try Again!';
    }
    else if (score <= 80 && score > 30) {
        score_color = '#ffbb00';
        prompt = 'Keep Practicing!';
    }
    else {
        score_color = '#0F9D58';
        prompt = 'Excellent!'
    }
    for (let i = 0; i < 5; i++) {
        let color;
        if (score_parts[i].correct / score_parts[i].total < 0.5) {
            color = '#ffe4e4';
            score_parts_color = '#ff3953';
        }
        else {
            color = '#d1eccf';
            score_parts_color = '#00771a';
        }

        detail_score = detail_score +
            '<div class="row mt-4">' +
                '<div class="col-1 col-lg-3">' +
                '</div>' +
                '<div class="col-10 col-lg-6 detail-score d-flex flex-row align-items-center" style="background-color: ' + color + '">' +
                    '<div class="row detail-row">' +
                        '<div class="col-md-2 col-3">' +
                            '<div class="detail-score-text"><font color=" '+ score_parts_color + '">' + score_parts[i].correct + '</font>/' + score_parts[i].total + '</div>'+
                        '</div>' +
                        '<div class="col-md-10 col-9">' +
                            '<div class="detail-part-text">' + detail_part[i] + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="col-1 col-lg-3">' +
                '</div>' +
            '</div>'
    }
    $("#test").html(
        '<div class="row">' +
            '<div class="col-12">' +
                '<div class="score-result" style="background-color: ' + score_color +'">' +
                    '<div class="score">' +
                        score +
                    '</div>' +
                '</div>' + 
            '</div>' +
        '</div>' + 
        '<div class="row mt-4">' +
            '<div class="col-12 text-center prompt" style="color: ' + score_color + '">' +
                prompt +
            '</div>' +
        '</div>' + detail_score +
        '<div class="row mt-4">' +
            '<div class="col-12 text-center prompt">' +
                '<button class="btn btn-danger me-2" onclick="' + "location.replace('/home')" + '"> Back to Home</button>' +
                '<button class="btn btn-primary" onclick="showDetail()">See Details</button>' +
            '</div>' +
        '</div>'
    );
}

function showResult(part, questions) {
    let question_html = '';

    for (let i = 0; i < questions[part - 1].length; i++) {
        if (questions[part - 1][i].type == "A") {
            let correct_answer_check = '';
            if (answers[part - 1][i] != questions[part - 1][i].correct_answer) {
                correct_answer_check = correct_answer_check + 
                    '<div class="correction text-danger"><i class="fa fa-times"></i> Incorrect </div>'
            }
            else {
                correct_answer_check = correct_answer_check + 
                    '<div class="correction text-success"><i class="fa fa-check"></i> Correct </div>'
            }

            let html_option = '';
            for (j = 0; j < questions[part - 1][i].options.length; j++ ) {
                let option_checked;
                if (questions[part - 1][i].options[j] == questions[part - 1][i].correct_answer) {
                    if (answers[part - 1][i] == questions[part - 1][i].correct_answer) {
                        option_checked = 'btn-success';
                    }
                    else {
                        option_checked = 'btn-success';
                    }
                }
                else if (questions[part - 1][i].options[j] == answers[part - 1][i]) {
                    option_checked = 'btn-danger';
                }
                else {
                    option_checked = 'btn-outline-dark';
                }

                html_option = html_option +
                '<div class="col-md-3 option mt-2">' +
                    '<input disabled type="radio" class="btn-check" name="result-' + (part) + '-' + (i+1) + '" id="result-option-' + (i+1) + '-1" autocomplete="off" value="' + questions[part - 1][i].options[j] + '">' +
                    '<label class="btn ' + option_checked + ' d-flex flex-row align-self-center align-items-center btn-option-' + (part) + '" for="option-' + (i+1) + '-1">' + questions[part - 1][i].options[j] + '</label>' +
                '</div>'
            }

            question_html = question_html + 
                '<div class="row">' + 
                    '<div class="col-12 question-card my-2">' + 
                        '<div class="row my-2">' + 
                            '<div class="col-1 question-num">' +
                                (i+1) + 
                            '.</div>' +
                            '<div class="col-10 question">' +
                                questions[part - 1][i].question + correct_answer_check +
                            '</div>' +
                        '</div>' +
                        '<div class="row">' + 
                            html_option +
                        '</div>' +
                    '</div>' +
                '</div>'                                            
        }

        else if (questions[part - 1][i].type == "B") {
            let correct_answer_check = '';

            if (answers[part - 1][i] != questions[part - 1][i].correct_answer) {
                correct_answer_check = correct_answer_check + 
                    '<div class="correction text-danger"><i class="fa fa-times"></i> Incorrect, Correct Answer : ' +  questions[part - 1][i].correct_answer + '</div>'
            }
            else {
                correct_answer_check = correct_answer_check + 
                    '<div class="correction text-success"><i class="fa fa-check"></i> Correct </div>'
            }

            question_html = question_html + 
                '<div class="row">' +
                    '<div class="col-12 question-card my-2">' + 
                        '<div class="row my-2">' + 
                            '<div class="col-1 question-num">' +
                                (i+1) + 
                            '.</div>' +
                            '<div class="col-10 question">' +
                                '<div class="row">' +
                                    '<div class="col-10">' +
                                        questions[part - 1][i].question + correct_answer_check +
                                    '</div>' + 
                                '</div>' +
                                '<div class="row">' + 
                                    '<div class="col-md-4 option mt-2">' +
                                        '<div class="form-group">' +
                                            '<input readonly="readonly" type="text" class="form-control form-hanzi" name="result-' + (part) + '-' + (i+1) + '" autocomplete="off" value="' + answers[part - 1][i] + '"> ' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
        }

        else {
            let correct_answer_check = '';

            if (answers[part - 1][i] != questions[part - 1][i].correct_answer) {
                correct_answer_check = correct_answer_check + 
                    '<div class="correction text-danger"><i class="fa fa-times"></i> Incorrect, Correct Answer : ' +  questions[part - 1][i].correct_answer + '</div>'
            }
            else {
                correct_answer_check = correct_answer_check + 
                    '<div class="correction text-success"><i class="fa fa-check"></i> Correct </div>'
            }

            question_html = question_html + 
                '<div class="row">' + 
                    '<div class="col-12 question-card my-2">' + 
                        '<div class="row my-2">' + 
                            '<div class="col-1 question-num">' +
                                (i+1) + 
                            '.</div>' +
                            '<div class="col-10 question">' +
                                '<div class="row">' +
                                    '<div class="col-10">' +
                                        questions[part - 1][i].question +  correct_answer_check +
                                    '</div>' + 
                                '</div>' +
                                '<div class="row">' + 
                                    '<div class="col-md-4 option mt-2">' +
                                        '<div class="form-group">' +
                                            '<input readonly="readonly" type="text" class="form-control form-hanzi" name="result-' + (part) + '-' + (i+1) + '" autocomplete="off" value="' + answers[part - 1][i] + '"> ' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
        }
    }

    let button_text;

    if (part != 5) {
        button_text = 'Next <i class="fa fa-arrow-right"></i>';

    }
    else {
        button_text = '<i class="fa fa-home"></i> Back to Home';
    }

    $("#test").html('<div class="row"><div class="col-12">' +
        '<h3 class="text-center part-text">Part ' + part + '</h3>' + 
        '<h5 class="text-center desc-text">' + part_desc[part - 1] + '</h5>' +
        '</div></div></div>' + question_html + 
        '<div class="row mt-2"><div class="col-12">' +
        '<button class="btn btn-primary btn-next" id="show-next-' + part + '" onclick="">' + button_text+ '</button>' +
        '</div></div>'
    );
}


function showDetail() {
    showResult(1, questions);
    $('#show-next-1').click(function() {
        //window.scrollTo(0, 0);
        showResult(2, questions);

        $('#show-next-2').click(function() {
            //window.scrollTo(0, 0);
            showResult(3, questions);

            $('#show-next-3').click(function() {
                //window.scrollTo(0, 0);
                showResult(4, questions);
                  
                $('#show-next-4').click(function() {
                    //window.scrollTo(0, 0);
                    showResult(5, questions);

                    $('#show-next-5').click(function() {
                        location.replace('/home');
                    });
                });
            });
        });
    });
}