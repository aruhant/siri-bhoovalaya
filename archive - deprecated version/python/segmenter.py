from collections import defaultdict
from dictionary.dictionary_reverse_parser import number_to_script



def segmenterF():
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
    char_to_index.update(
        {
            "ಾ": 1, "ಿ": 3, "ೀ": 4, "ು": 6, "ೂ": 7, "ೃ": 9, "ೄ": 10, "ೆ": 15, "ೇ": 16, "ೈ": 18, "ೊ":21, "ೋ": 22, "ೌ": 24, "ಂ": 46, "ಃ": 46
        }
    )


    index_to_matraa = {v: k for k, v in char_to_index.items()}



    #dictionary = [ "mobile", "samsung", "sam", "sung", "man", "mango", "icecream", "and", "go", "i",
    #                "like", "ice", "cream" ,"cesa", "samsun", "gtbk"]

    #read dictionary from file: modified_dictionary_out.txt
    dictionary = []
    def read_from_file(filename, delimiter, target):
        with open(filename, 'r', encoding='utf-8') as infile:
            for word in infile:
                word = word.strip()
                word = word.split(delimiter)
                # remove empty strings
                word = [w for w in word if w]
                word = [chr(int(w)+64) for w in word]
                word = ''.join(word)        
                target.append(word)
    read_from_file('./dictionary/final_dictionary.txt', ',', dictionary)
    # find max length of word in dictionary
    max_length = max([len(word) for word in dictionary])

    heuresticN = 8
    # divide the dictionary into groups of words of same length
    grouped_dictionary = defaultdict(list)
    for word in dictionary:
        length = len(word)
        if length in grouped_dictionary:
            grouped_dictionary[length].append(word)
        else:
            grouped_dictionary[length] = [word]
    max_length = max(grouped_dictionary.keys())

    #now read word from a space separated file called ./output/output1.txt
    word = []
    read_from_file('./output/output_1.txt', ' ', word)


    def alphabetToNumber(word):
        return [ord(c) - 64 for c in word]



    # returns a list of segments of the word
    def wordBreak(word):
        if len(word) < heuresticN:
            return best_break(word)
        start = min(max_length, len(word))
        for i in range(start, 0, -1):
            for j in range(0, len(word) - i + 1):
                prefix = word[j:j+i]
                if prefix in grouped_dictionary[i]:
                    return wordBreak(word[:j]) + [prefix] + wordBreak(word[j+i:])
                
    def best_break(word):
        optimal_break = list(word)
        end = min(max_length, len(word))+1
        for i in range(1,end):
            for j in range(0, len(word) - i + 1):
                prefix = word[j:j+i]
                if prefix in grouped_dictionary[i]:
                    left_break = best_break(word[:j])
                    right_break = best_break(word[j+i:])
                    current_break = left_break + [prefix] + right_break
                    if len(current_break) < len(optimal_break):
                        optimal_break = current_break
        return optimal_break
        
    result = wordBreak(word[0])


    for word in result:
        n=alphabetToNumber(word)
        print(number_to_script(n), end=' ')


segmenterF()