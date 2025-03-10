
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


char_to_index = {char: i for i, char in enumerate(valid_characters)}


# add matras of the vowels with same index as the vowel
matra_to_index = {
            "ಾ": 1, "ಿ": 3, "ೀ": 4, "ು": 6, "ೂ": 7, "ೃ": 9, "ೄ": 10, "ೆ": 15, "ೇ": 16, "ೈ": 18, "ೊ":21, "ೋ": 22, "ೌ": 24
        }
char_to_index.update(
    matra_to_index
)
index_to_matra = {v: k for k, v in matra_to_index.items()}
index_to_matra.update(
    {
        0: "",
        2: "ಾ", 5: "ೀ", 8: "ೂ", 11: "ೄ", 17: "ೇ", 19: "ೈ", 20: "ೈ", 23:"ೋ", 25: "ೌ", 26: "ೌ",
        60: "ಂ",
        61: "ಃ",
    }
)



def number_to_script(test_array):
    can_use_matraa = False
    out =""
    for i,c in enumerate(test_array):
        # 0-indexed
        c = c-1
        character = valid_characters[c]
        #if vowel
        if c <= 26:
            if can_use_matraa:
                out += index_to_matra[c]
                can_use_matraa = False
            else:
                out += character
        elif c <= 59:
            can_use_matraa = True
            out += character 
            # if the next character is not a matra, add halant
            if i < len(test_array) - 1 and test_array[i+1] > 27:
                out += '್'
        else:
            out += character
            can_use_matraa = False
    return out