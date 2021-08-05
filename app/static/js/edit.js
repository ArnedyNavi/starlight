function openPopUp(id) {

    var id_hanzi = 'hanzi-' + id;
    var id_pinyin = 'pinyin-' + id;
    var id_meaning = 'meaning-' + id;
    var id_data_id = 'id-' + id;

    var hanzi = document.getElementById(id_hanzi).innerHTML;
    var pinyin = document.getElementById(id_pinyin).innerHTML;
    var meaning = document.getElementById(id_meaning).innerHTML;
    var data_id = document.getElementById(id_data_id).value;

    document.getElementById('edit-hanzi').value = hanzi;
    document.getElementById('edit-pinyin').value = pinyin;
    document.getElementById('edit-meaning').value = meaning;
    document.getElementById('edit-id').value = data_id;

    document.getElementById("popup_edit").style.display = "block";
}

function closePopUp() {
    document.getElementById("popup_edit").style.display = "none";
}

function openPopUpAdd(id) {

    document.getElementById("popup_add").style.display = "block";
}

function closePopUpAdd() {
    document.getElementById("popup_add").style.display = "none";
}

function confirmPopUp(id) {
    document.getElementById('delete-id').value = id;
    document.getElementById("confirm_popup").style.display = "block";
}

function closeConfirmPopUp() {
    document.getElementById("confirm_popup").style.display = "none";
}