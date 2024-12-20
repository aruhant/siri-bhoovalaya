import re
import pickle
# add to to_remove set
to_remove = ['~','Ã', '£', '8', '<', '=', 'ö', '/', ',', '+', '(', 'ð', ')', '¿', "'", 'ç', ';', '.', '-', '"', "'", 'B', '_', '<', 'P', '¥', 'j', '-', '`', 'C', ',', 'L', 'E', '¢', 'F', 'n', '4', '»', '3', '(', 's', '«', 'w', '5', '₹', 'U', 'I', '|', '}', 'Y', '"', ')', '.', 'i', 'u', 'z', 'a', '1', '%', '9', '!', '€', '॥', 'g', 'k', "'", '+', '>', 'W', 'K', ';', '@', '7', '*', 'M', '—', 'H', '{', 'R', '°', 'S', 'b', '6', 'y', 'x', 'r', 'T', 'N', '©', '”', 'Q', ':', ']', '[', '?', '2', 'e', 'l', '$', 'h', 't', 'V', '§', 'G', 'Z', '&', 'f', 'd', 'D', 'p', '“', "।", "v", "॥", "।", "\\","a","b","c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"]
valid_characters = [
    # Vowels: hasv, dirgh, pluta
    # 1, 2, 3
    "ಅ", "ಆ", "ಆಾ",
    # 4, 5, 6
    "ಇ", "ಈ", "ಈೀ",
    # 7, 8, 9
    "ಉ", "ಊ", "ಊೂ",
    # 10, 11, 12
    "ಋ", "ೠ", "ೠೄ",
    # 13, 14, 15
    "ಳ", "ಳು", "ಳೂ",
    # 16, 17, 18
    "ಎ", "ಏ", "ಏೋ",
    # 19, 20, 21
    "ಐ", "ಐೖ", "ಐೖೖ",
    # 22, 23, 24
    "ಒ", "ಓ", "ಓೋ",
    # 25, 26, 27
    "ಔ", "ಔೌ", "ಔೌೌ",
    # Grouped consonants
    # 28, 29, 30, 31, 32
    "ಕ್", "ಖ್", "ಗ್", "ಘ್", "ಙ್",
    # 33, 34, 35, 36, 37
    "ಚ್", "ಛ್", "ಜ್", "ಝ್", "ಞ್",
    # 38, 39, 40, 41, 42
    "ಟ್", "ಠ್", "ಡ್", "ಢ್", "ಣ್",
    # 43, 44, 45, 46, 47
    "ತ್", "ಥ್", "ದ್", "ಧ್", "ನ್",
    # 48, 49, 50, 51, 52
    "ಪ್", "ಫ್", "ಬ್", "ಭ", "ಮ್",
    # 53, 54, 55, 56, 57
    "ಯ್", "ರ್", "ಲ್", "ವ್", "ಶ್",
    # Un-grouped consonants
    # 58, 59, 60
    "ಷ್", "ಸ್", "ಹ್",
    # Special characters
    # 61, 62, 63, 64
    "ಂ", "ಃ", "...", "::"
]
invalid_characters = set()
def read_txt(file_name):
    with open(file_name) as file:
        lines = file.read().splitlines()
    words = set()
    for line in lines:
        for word in re.split(r'[ -]', line):
            word = cleanLine(word)
            words.add(word)
    return words

def readPickle(pkl_file_path):
    with open(pkl_file_path, 'rb') as f:
        p=pickle.load(f)
        words = sorted(p.keys())
        return words

def write_file(file_name, words):
    words = sorted(words)
    with open(file_name, 'w') as file:
        for word in words:
            file.write(word + '\n')

def cleanLine(line):
    line = re.sub(r'\([^)]*\)', '', line)
    line = re.sub(' +', ' ', line)
    line = line.replace('o', 'ಂ')
    line = line.replace('O', 'ಂ')
    line = line.replace('0', 'ಂ')
    line = line.replace('०', 'ಂ')
    line = line.replace('೦', 'ಂ')
    line = line.replace(' ಂ', 'ಂ')
    line = line.replace('ಂಂ', 'ಂ')
    line = line.replace(' ಃ', 'ಃ')
    line = line.replace('ೞ', 'ಳ')
    line = line.replace( 'ಱ', 'ರ')
    line = line.replace('ೇ', 'ೇ')
    line = line.replace('ೈ', 'ೈ')
    line = line.replace('\u200c', '')
    line = line.replace('\u200d', '')
    line = line.replace('\u200b', '')
    line = line.replace('ೖ', 'ೃ')


    for c in to_remove:
        line = line.replace(c, '')


    for c in line:
        for k in valid_characters:
            if c not in k:
                invalid_characters.add(c)
    return line

# combine two dictionaries and write to final_dict.txt
def combine_dict(dict1, dict2, dict3):
    words = dict1.union(dict2)
    words = words.union(dict3)
    write_file('final_dict.txt', words)




#readPickle('dictionary.pkl')
words = read_txt('./dictionary/dictionary_in.txt')
print(len(words))
write_file('./dictionary/modified_dictionary_out.txt', words)
#print(invalid_characters)
#write invlaid characters to a file called invalid_characters.txt
#write_file('invalid_characters.txt', invalid_characters)
