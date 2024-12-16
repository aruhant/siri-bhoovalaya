import re

# read file and return a list of words
def read_file(file_name):
    with open(file_name) as file:
        lines = file.read().splitlines()
# define a set to store unique words
    words = set()
    for line in lines:
        line = re.sub(r'\([^)]*\)', '', line)
        # split the line into words by all characters that are no-word characters
        # print all non-word characters in word for debugging
        #
        for word in re.split(r'[ -]', line):
            # remove all non-word characters from the word
            # if the word containts non-word characters, print it for debugging
            w = re.sub(r'[,|]', '', word)
            if w != word:
                print(word, w)
            word = re.sub(r'[,|]', '', word)
            words.add(word)
    return words


# write a list of words to a file
def write_file(file_name, words):
    with open(file_name, 'w') as file:
        for word in words:
            file.write(word + '\n')

input_file = 'dictionary_in.txt'
output_file = 'dictionary_out.txt'
words = read_file(input_file)
# print the number of words in the file
print(len(words))
# write the words to the output file
write_file(output_file, words)


