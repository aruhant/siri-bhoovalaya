#!/usr/local/bin/python
# -*- coding: utf-8 -*-

"""
This is for demo purposes
1) print chapter 1_chakra
2) print chakra_bandha
3) print decoded sequence
4) print decoded sequence in Hindi
5) print decoded sequence in Kannada
6) print final partioned sequence in Kannada
"""
from segmenter import segmenterF

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
    with open(f'output/output_[index+1].txt', 'w') as f:
        f.write(' '.join(map(str, output_list)))

def print_chakra(file_path):
    """Main function to process the file and generate output files."""
    processed = read_file(file_path)
    """
    for i, matrix in enumerate(processed):
        output_list = chakra_bandha_traversal(matrix)
        output_list = replace_with_letters(output_list)
        write_output(output_list, i)
    """
    # print chapter 1_chakra as a 2D matrix (27x27)
    for i, c in enumerate(processed[0]):
        if i % 27 == 0:
            print()
        print(f'{c:02}', end=' ')
  

mappingH = [
    "अ", "आ", "आा", "इ", "ई", "ईी", "उ", "ऊ", "ऊू", "ऋ", "ॠ", "ॠॄ", 
    "ळ", "ळु", "ळू", "ए", "एा", "एाा", "ऐ", "ऐो", "ऐोो", "ओ", "ओो", 
    "ओोो", "औ", "औौ", "औौौ", "क्", "ख्", "ग्", "घ्", "ङ्", "च्", 
    "छ्", "ज्", "झ्", "ञ्", "ट्", "ठ्", "ड्", "ढ्", "ण्", "त्", 
    "थ्", "द्", "ध्", "न्", "प्", "फ्", "ब्", "भ्", "म्", "य्", 
    "र्", "ल्", "व्", "श्", "ष्", "स्", "ह्", "ं", "ः", "...", "::"
]



mappingK = [
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


temp_chakra_bandha= [
    [380, 409, 438, 467, 496, 525, 554, 583, 612, 641, 670, 699, 728, 1, 30, 59, 88, 117, 146, 175, 204, 233, 262, 291, 320, 349, 378],
    [408, 437, 466, 495, 524, 553, 582, 611, 640, 669, 698, 727, 27, 29, 58, 87, 116, 145, 174, 203, 232, 261, 290, 319, 348, 377, 379],
    [436, 465, 494, 523, 552, 581, 610, 639, 668, 697, 726, 26, 28, 57, 86, 115, 144, 173, 202, 231, 260, 289, 318, 347, 376, 405, 407],
    [464, 493, 522, 551, 580, 609, 638, 667, 696, 725, 25, 54, 56, 85, 114, 143, 172, 201, 230, 259, 288, 317, 346, 375, 404, 406, 435],
    [492, 521, 550, 579, 608, 637, 666, 695, 724, 24, 53, 55, 84, 113, 142, 171, 200, 229, 258, 287, 316, 345, 374, 403, 432, 434, 463],
    [520, 549, 578, 607, 636, 665, 694, 723, 23, 52, 81, 83, 112, 141, 170, 199, 228, 257, 286, 315, 344, 373, 402, 431, 433, 462, 491],
    [548, 577, 606, 635, 664, 693, 722, 22, 51, 80, 82, 111, 140, 169, 198, 227, 256, 285, 314, 343, 372, 401, 430, 459, 461, 490, 519],
    [576, 605, 634, 663, 692, 721, 21, 50, 79, 108, 110, 139, 168, 197, 226, 255, 284, 313, 342, 371, 400, 429, 458, 460, 489, 518, 547],
    [604, 633, 662, 691, 720, 20, 49, 78, 107, 109, 138, 167, 196, 225, 254, 283, 312, 341, 370, 399, 428, 457, 486, 488, 517, 546, 575],
    [632, 661, 690, 719, 19, 48, 77, 106, 135, 137, 166, 195, 224, 253, 282, 311, 340, 369, 398, 427, 456, 485, 487, 516, 545, 574, 603],
    [660, 689, 718, 18, 47, 76, 105, 134, 136, 165, 194, 223, 252, 281, 310, 339, 368, 397, 426, 455, 484, 513, 515, 544, 573, 602, 631],
    [688, 717, 17, 46, 75, 104, 133, 162, 164, 193, 222, 251, 280, 309, 338, 367, 396, 425, 454, 483, 512, 514, 543, 572, 601, 630, 659],
    [716, 16, 45, 74, 103, 132, 161, 163, 192, 221, 250, 279, 308, 337, 366, 395, 424, 453, 482, 511, 540, 542, 571, 600, 629, 658, 687],
    [15, 44, 73, 102, 131, 160, 189, 191, 220, 249, 278, 307, 336, 365, 394, 423, 452, 481, 510, 539, 541, 570, 599, 628, 657, 686, 715],
    [43, 72, 101, 130, 159, 188, 190, 219, 248, 277, 306, 335, 364, 393, 422, 451, 480, 509, 538, 567, 569, 598, 627, 656, 685, 714, 14],
    [71, 100, 129, 158, 187, 216, 218, 247, 276, 305, 334, 363, 392, 421, 450, 479, 508, 537, 566, 568, 597, 626, 655, 684, 713, 13, 42],
    [99, 128, 157, 186, 215, 217, 246, 275, 304, 333, 362, 391, 420, 449, 478, 507, 536, 565, 594, 596, 625, 654, 683, 712, 12, 41, 70],
    [127, 156, 185, 214, 243, 245, 274, 303, 332, 361, 390, 419, 448, 477, 506, 535, 564, 593, 595, 624, 653, 682, 711, 11, 40, 69, 98],
    [155, 184, 213, 242, 244, 273, 302, 331, 360, 389, 418, 447, 476, 505, 534, 563, 592, 621, 623, 652, 681, 710, 10, 39, 68, 97, 126],
    [183, 212, 241, 270, 272, 301, 330, 359, 388, 417, 446, 475, 504, 533, 562, 591, 620, 622, 651, 680, 709, 9, 38, 67, 96, 125, 154],
    [211, 240, 269, 271, 300, 329, 358, 387, 416, 445, 474, 503, 532, 561, 590, 619, 648, 650, 679, 708, 8, 37, 66, 95, 124, 153, 182],
    [239, 268, 297, 299, 328, 357, 386, 415, 444, 473, 502, 531, 560, 589, 618, 647, 649, 678, 707, 7, 36, 65, 94, 123, 152, 181, 210],
    [267, 296, 298, 327, 356, 385, 414, 443, 472, 501, 530, 559, 588, 617, 646, 675, 677, 706, 6, 35, 64, 93, 122, 151, 180, 209, 238],
    [295, 324, 326, 355, 384, 413, 442, 471, 500, 529, 558, 587, 616, 645, 674, 676, 705, 5, 34, 63, 92, 121, 150, 179, 208, 237, 266],
    [323, 325, 354, 383, 412, 441, 470, 499, 528, 557, 586, 615, 644, 673, 702, 704, 4, 33, 62, 91, 120, 149, 178, 207, 236, 265, 294],
    [351, 353, 382, 411, 440, 469, 498, 527, 556, 585, 614, 643, 672, 701, 703, 3, 32, 61, 90, 119, 148, 177, 206, 235, 264, 293, 322],
    [352, 381, 410, 439, 468, 497, 526, 555, 584, 613, 642, 671, 700, 729, 2, 31, 60, 89, 118, 147, 176, 205, 234, 263, 292, 321, 350]];


#function to read from a file seperated by \n and print each line
def print_file(file_path, width=-1, pad =""):
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        contents = f.read()
        l = contents.split('\n')[0].split(' ')
        for i, c in enumerate(l):  
            if width == -1:
                print( c , end='  ')
            else:
                print( (pad+c)[-width:] , end=' ')
input_file = "chapter_1_8.txt"
print("\033[94m")
print("CHAPTER 1_CHAKRA:")
# ansi color code for green
print("________________")
print("\033[0m")
input()
print_chakra(input_file)

print("\n\n")
print("\033[94m")
print("CHAKRA_BANDHA:")
print("________________")
print("\033[0m")
input()
for row in temp_chakra_bandha:
    for c in row:
        print(f'{c:03}', end=' ')
    print()
    
print("\n\n")
print("\033[94m")
print("DECODED NUMERICAL SEQUENCE:")
print("________________")
print("\033[0m")
input()
print_file("./output/output_1.txt", 2, "0")
print("\n\n")
print("\033[94m")
print("DECODED SEQUENCE IN DEVANAGARI:")
print("________________")
print("\033[0m")
input()
print_file("./outputH/output_1.txt")
print("\n\n")
print("\033[94m")
print("DECODED SEQUENCE IN KANNADA:")
print("________________")
print("\033[0m")
input()
print_file("./outputK/output_1.txt")
print("\n\n")
print("\033[94m")
print("FINAL SHLOKAS IN KANNADA:")
print("________________")
print("\033[0m")
print("ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ ವಯಭ್ವದಿನ್ದ ಅಷ್ಟಗುಣನ್ಗಳೋಳ ಓಮ್ದಮ್ ಸರ್ಷ್ಟಿಗೆ ಮನ್ಗಳ ಪರ್ಯಾಯದಿನಿತ ಅಷ್ಟಮ ಜಿನಗೆರಗುವೆನು ಟಣೆಯ ಕೋಲು ಪುಸ್ತಕ ಪಿನಛ ಪಾತ್ರೆಯ ಅವತ್ರದಾ ಕಮನ್ಡಲದ ನವಕಾರ ಮನತ್ರಸಿದಿಗೆ ಕಾರಣವೆನದು ಭುವಲಯದೊಳೊಪೇಳದ ಮಹಿಮಾ ಟವಣೆಯೊಳಕ್ಷರ ದನ್ಕವ ಸ್ಥಾಪಿಸಿ ದವಯವವದೆ ಮಹಾವ್ರತು ಅವರವರಿಗೆ ತಕ್ಶಕ್ತಿಗೆ ವರ ವಾದನ ವಮನ್ಗಲದ ಭು ವಲಯ ವಿಹವಾಣಿ ಓಮಕಾರದತಿಶಯ ವಿಹನಿನಮಹಾವೀರವಾಣಿ ಎನದೆನುವ ಮಹಿಮೆಯ ಮನ್ಗಲ ಪ್ರಾಭರುತವೆನುವ ಮಹಸಿಧಕಾವ್ಯ ಭೂವಲಯ ಹಕ ಉ ದ ವಿಸ್ಮ ಯೋಗದೊಳಗೆ ಇಪತೆನ್ಟು ಪ್ರಕಟದೊಳ ಅರವತ್ಮ ಕುಡೆ ಸಕಲಾನ ಕದೋಳ ಬಿಟ ಸೊನ್ಯೆ ವೆನಟೆನ್ಟು ಸಕಲಾಗಮ ಏಳು ಭನ್ಗ ಕಮಲಗಳೇಳು ಮುನ್ದಕೆಪೋಗುತಿರ್ದಾಗ ಕ್ರಮದೊಳಗೆರಡು ಕಾಲ್ನೊರು ತಮಲಾನ ಕೆದುಸೊನೆಯು ಆರು ಎರಡಯ್ದು ಕಮಲದಗನ್ಧ ಭೂವಲಯ ಮ್ಮಹ್ರುದಯದೊಳಾ ಕಮಲಗಳ ಚಲಿಪಾಗ ವಿಮಲಾನ್ಕ ಗೆಲುವನ್ದವದು ಸಮವನು ಬೆಸದೊಳು ಭಾಗಿಸೆ ಸೊನ್ಯ ಕ್ರಮವಿಹ ಕಾವಯ ಭೂವಲಯ ಸಿರಿ ಭೂವಲಯ ಸಿಧಾನ್ತ ದ ಮನ್ಗಲ ಪಾಹುಢವು")


