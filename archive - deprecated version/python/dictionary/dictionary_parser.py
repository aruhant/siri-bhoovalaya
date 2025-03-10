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
    "ಕ", "ಖ", "ಗ", "ಘ", "ಙ",
    # 33, 34, 35, 36, 37
    "ಚ", "ಛ", "ಜ", "ಝ", "ಞ",
    # 38, 39, 40, 41, 42
    "ಟ", "ಠ", "ಡ", "ಢ", "ಣ",
    # 43, 44, 45, 46, 47
    "ತ", "ಥ", "ದ", "ಧ", "ನ",
    # 48, 49, 50, 51, 52
    "ಪ", "ಫ", "ಬ", "ಭ", "ಮ",
    # 53, 54, 55, 56, 57
    "ಯ", "ರ", "ಲ", "ವ", "ಶ",
    # Un-grouped consonants
    # 58, 59, 60
    "ಷ", "ಸ", "ಹ",
    # Special characters
    # 61, 62, 63, 64
    "ಂ", "ಃ", "...", "::"
]

# make a reverse mapping of the characters using a dictionary
char_to_index = {char: i for i, char in enumerate(valid_characters)}
# add matras of the vowels with same index as the vowel
char_to_index.update(
    {
        "ಾ": 1, "ಿ": 3, "ೀ": 4, "ು": 6, "ೂ": 7, "ೃ": 9, "ೄ": 10, "ೆ": 15, "ೇ": 16, "ೈ": 18, "ೊ":21, "ೋ": 22, "ೌ": 24
    }
)

# break a into individual characters and write to a file
with open('./dictionary/final_dictionary.txt', 'w', encoding='utf-8') as f:
    with open('/Users/amit/Documents/bhoovalaya/code/dictionary/modified_dictionary_out.txt', 'r', encoding='utf-8') as infile:
        for line in infile:
            word = line.strip()
            for i, c in enumerate(word):
                if c!='್':
                    numeric = char_to_index[c] + 1
                    f.write(str(numeric))
                    if (numeric >= 28 and numeric<=60) and (i == len(word) - 1 or ((word[i+1] != '್') and char_to_index[word[i+1]]>=27 and char_to_index[word[i+1]]<=59)):
                        f.write(',1')
                    if i < len(word) - 1:
                        f.write(',')
            f.write('\n')

"""
#print equivalent of ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ
word = "ಹಾಅಡ್ಹಹ್ಣಾಆಹಂ"
# these are the rules:
for i, c in enumerate(word):
    if c!='್':
        numeric = char_to_index[c] + 1
        #if in consonant group, check if next character is halant
        print(numeric, end = '')
        if (numeric >= 28 and numeric<=60) and (i == len(word) - 1 or ((word[i+1] != '್') and char_to_index[word[i+1]]>26)):
            print(',1', end='')
        if i < len(word) - 1:
            print(',', end='')
"""

