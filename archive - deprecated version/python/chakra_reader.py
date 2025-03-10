Ncol = 9
size = 27
# for a 27x27 list and i and j, get equivalent 1d index
def getIndex(i, j):
    return i*size + j

# reading a comma separated text file
def read_file(file_path):
    #open the text file
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        #read the contents of the file
        contents = f.read()
        #remove any leading or trailing white spaces
        contents = contents.strip()
        #return a 2d list such that each element is a column
        rows = [row.split(',') for row in contents.split('\n')]
        return [[int(row[i]) for row in rows] for i in range(9)]
        

def chakra_bandha_traversal(matrix):
    """Implements the chakra_bandha traversal on a 2D matrix (although passed as a 1d matrix)."""
    mid = size // 2
    row, col = 0, mid
    output_list = []
    # make a set of seen (row, col) pairs
    seen = set()
    for _ in range(size * size):
        output_list.append(matrix[getIndex(row, col)])
        seen.add((row, col))
        #if middle column of last row, break
        if row == size - 1 and col == mid:
            break
        row = (row - 1) % size  # Move diagonally down
        col = (col + 1) % size  # Wrap around the edges
        if (row, col) in seen:
            # move vertically downwards without changing column
            row = (row + 2) % size
            col = (col - 1) % size  
    return output_list

def write_output(output_list, index):
    """Writes the output list to a file named output_<index>.txt."""
    with open(f'output_{index+1}.txt', 'w') as f:
        f.write(' '.join(map(str, output_list)))

def process_file(file_path):
    """Main function to process the file and generate output files."""
    processed = read_file(file_path)

    for i, matrix in enumerate(processed):
        output_list = chakra_bandha_traversal(matrix)
        output_list = replace_with_letters(output_list)
        write_output(output_list, i)

mapping = [
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

def replace_with_letters(number_list):
    # Create an empty result matrix
    result_matrix = []
    # Iterate over each row of the matrix
    for number in number_list:
        # Check if number is within the valid range of the mapping (1 to 64)
        assert 1 <= number <= 64
        result_matrix.append(mapping[number - 1])
    return result_matrix


input_file = "chapter_1_8.txt"
process_file(input_file)
