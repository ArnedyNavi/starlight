import csv

def open_csv(file_name):
    data = []
    with open(file_name, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter='\t')
        for row in reader:
            data_row = {"db_id" : "hsk-"+row[0], "hanzi" : row[2], "pinyin" : row[3], "meaning" : row[4]}
            data.append(data_row)
    return data