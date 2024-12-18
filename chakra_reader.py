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
    with open(f'output/output_{index+1}.txt', 'w') as f:
        f.write(' '.join(map(str, output_list)))

def process_file(file_path):
    """Main function to process the file and generate output files."""
    processed = read_file(file_path)

    for i, matrix in enumerate(processed):
        output_list = chakra_bandha_traversal(matrix)
        output_list = replace_with_letters(output_list)
        write_output(output_list, i)

mapping = [
    "अ", "आ", "आा", "इ", "ई", "ईी", "उ", "ऊ", "ऊू", "ऋ", "ॠ", "ॠॄ", 
    "ळ", "ळु", "ळू", "ए", "एा", "एाा", "ऐ", "ऐो", "ऐोो", "ओ", "ओो", 
    "ओोो", "औ", "औौ", "औौौ", "क्", "ख्", "ग्", "घ्", "ङ्", "च्", 
    "छ्", "ज्", "झ्", "ञ्", "ट्", "ठ्", "ड्", "ढ्", "ण्", "त्", 
    "थ्", "द्", "ध्", "न्", "प्", "फ्", "ब्", "भ्", "म्", "य्", 
    "र्", "ल्", "व्", "श्", "ष्", "स्", "ह्", "ं", "ः", "...", "::"
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
