#include <iostream>
#include <cassert>
#include <vector>
using namespace std;
// function to print a 1d array of size n
void print_array(int *arr, int n)
{
    for (int i = 0; i < n; i++)
    {
        cout << arr[i] << " ";
    }
    cout << endl;
}

// function to print a 2d array of size n*n
void print_2d_array(int **arr, int n)
{
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            cout << arr[i][j] << " ";
        }
        cout << endl;
    }
}

class Chakra
{
    protected:
    int **chakra;
    int n;

public:
    Chakra(int **chakra, int n) : n(n), chakra(chakra) {}
    ~Chakra()
    {
        for (int i = 0; i < n; i++)
        {
            delete[] chakra[i];
        }
        delete[] chakra;
    }
    int *operator[](int i)
    {
        return chakra[i];
    }
    int **get_chakra()
    {
        return chakra;
    }
    int get_n()
    {
        return n;
    }
    Chakra get_sub_chakra(int sub_chakraN)
    {
        // returns type Chakra of size (n/3)*(n/3) that is the sub-chakra at sub_chakraN
        int sub_chakra_size = n / 3;
        int **sub_chakra = new int *[sub_chakra_size];
        for (int i = 0; i < sub_chakra_size; i++)
        {
            sub_chakra[i] = new int[sub_chakra_size];
        }
        int from_left = (sub_chakraN % 3 * sub_chakra_size);
        int from_top = (sub_chakraN / 3 * sub_chakra_size);
        for (int i = 0; i < sub_chakra_size; i++)
        {
            for (int j = 0; j < sub_chakra_size; j++)
            {
                sub_chakra[i][j] = chakra[i + from_top][j + from_left];
            }
        }
        return Chakra(sub_chakra, sub_chakra_size);        
    }
};



class Chakra27 : public Chakra
{
public:
    Chakra27(int **chakra) : Chakra(chakra, 27) {}
};

class Bandha
{
    protected:
    int **bandha;
    int n;

    
public:
    Bandha(int n, int **bandha) : n(n), bandha(bandha) {}
    // chakra bandha of size n
    Bandha(int n) : n(n)
    {
        for (int i = 0; i < n; i++)
        {
            bandha[i] = new int[n];
        }
        // this array contains the visited status of each cell
        bool visited[n][n];
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                visited[i][j] = false;
            }
        }
        // the middle of the first row is the starting point
        int row = 0;
        int collumn = (n - 1) / 2;
        // value to be assigned to a cell
        int value = 1;
        // Start from the middle of the first row and move diagonally up
        while (true)
        {
            // mark the cell as visited and assign the value
            visited[row][collumn] = true;
            bandha[row][collumn] = value;
            // the middle of the last row is the end point
            if (row == n - 1 && collumn == (n - 1) / 2)
            {
                break;
            }
            // move diagonally up accounting for the wrap around
            row = (((row - 1) % n) + n) % n;
            collumn = (((collumn + 1) % n) + n) % n;
            // if the cell is already visited, jump downwards
            if (visited[row][collumn])
            {
                row = (((row + 2) % n) + n) % n;
                collumn = (((collumn - 1) % n) + n) % n;
            }
            value++;
        }
    }
    ~Bandha()
    {
        for (int i = 0; i < n; i++)
        {
            delete[] bandha[i];
        }
        delete[] bandha;
    }
    // method to set the bandha
    int *apply(Chakra chakra)
    {
        int *sequenced = new int[n * n];
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                sequenced[bandha[i][j] - 1] = chakra[i][j];
            }
        }
        return sequenced;
    }

    void apply_insert(Chakra chakra, int* sequenced, int start)
    {
        start--;
        start = chakra.get_n()*chakra.get_n()*start;
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                sequenced[start + bandha[i][j]-1] = chakra[i][j];
            }
        }
    }
};

class Chakra_Bandha_27 
{
public:
    static int* apply (Chakra27 chakra)
    {
        int temp_chakra_bandha[27][27]{
            {380, 409, 438, 467, 496, 525, 554, 583, 612, 641, 670, 699, 728, 1, 30, 59, 88, 117, 146, 175, 204, 233, 262, 291, 320, 349, 378},
            {408, 437, 466, 495, 524, 553, 582, 611, 640, 669, 698, 727, 27, 29, 58, 87, 116, 145, 174, 203, 232, 261, 290, 319, 348, 377, 379},
            {436, 465, 494, 523, 552, 581, 610, 639, 668, 697, 726, 26, 28, 57, 86, 115, 144, 173, 202, 231, 260, 289, 318, 347, 376, 405, 407},
            {464, 493, 522, 551, 580, 609, 638, 667, 696, 725, 25, 54, 56, 85, 114, 143, 172, 201, 230, 259, 288, 317, 346, 375, 404, 406, 435},
            {492, 521, 550, 579, 608, 637, 666, 695, 724, 24, 53, 55, 84, 113, 142, 171, 200, 229, 258, 287, 316, 345, 374, 403, 432, 434, 463},
            {520, 549, 578, 607, 636, 665, 694, 723, 23, 52, 81, 83, 112, 141, 170, 199, 228, 257, 286, 315, 344, 373, 402, 431, 433, 462, 491},
            {548, 577, 606, 635, 664, 693, 722, 22, 51, 80, 82, 111, 140, 169, 198, 227, 256, 285, 314, 343, 372, 401, 430, 459, 461, 490, 519},
            {576, 605, 634, 663, 692, 721, 21, 50, 79, 108, 110, 139, 168, 197, 226, 255, 284, 313, 342, 371, 400, 429, 458, 460, 489, 518, 547},
            {604, 633, 662, 691, 720, 20, 49, 78, 107, 109, 138, 167, 196, 225, 254, 283, 312, 341, 370, 399, 428, 457, 486, 488, 517, 546, 575},
            {632, 661, 690, 719, 19, 48, 77, 106, 135, 137, 166, 195, 224, 253, 282, 311, 340, 369, 398, 427, 456, 485, 487, 516, 545, 574, 603},
            {660, 689, 718, 18, 47, 76, 105, 134, 136, 165, 194, 223, 252, 281, 310, 339, 368, 397, 426, 455, 484, 513, 515, 544, 573, 602, 631},
            {688, 717, 17, 46, 75, 104, 133, 162, 164, 193, 222, 251, 280, 309, 338, 367, 396, 425, 454, 483, 512, 514, 543, 572, 601, 630, 659},
            {716, 16, 45, 74, 103, 132, 161, 163, 192, 221, 250, 279, 308, 337, 366, 395, 424, 453, 482, 511, 540, 542, 571, 600, 629, 658, 687},
            {15, 44, 73, 102, 131, 160, 189, 191, 220, 249, 278, 307, 336, 365, 394, 423, 452, 481, 510, 539, 541, 570, 599, 628, 657, 686, 715},
            {43, 72, 101, 130, 159, 188, 190, 219, 248, 277, 306, 335, 364, 393, 422, 451, 480, 509, 538, 567, 569, 598, 627, 656, 685, 714, 14},
            {71, 100, 129, 158, 187, 216, 218, 247, 276, 305, 334, 363, 392, 421, 450, 479, 508, 537, 566, 568, 597, 626, 655, 684, 713, 13, 42},
            {99, 128, 157, 186, 215, 217, 246, 275, 304, 333, 362, 391, 420, 449, 478, 507, 536, 565, 594, 596, 625, 654, 683, 712, 12, 41, 70},
            {127, 156, 185, 214, 243, 245, 274, 303, 332, 361, 390, 419, 448, 477, 506, 535, 564, 593, 595, 624, 653, 682, 711, 11, 40, 69, 98},
            {155, 184, 213, 242, 244, 273, 302, 331, 360, 389, 418, 447, 476, 505, 534, 563, 592, 621, 623, 652, 681, 710, 10, 39, 68, 97, 126},
            {183, 212, 241, 270, 272, 301, 330, 359, 388, 417, 446, 475, 504, 533, 562, 591, 620, 622, 651, 680, 709, 9, 38, 67, 96, 125, 154},
            {211, 240, 269, 271, 300, 329, 358, 387, 416, 445, 474, 503, 532, 561, 590, 619, 648, 650, 679, 708, 8, 37, 66, 95, 124, 153, 182},
            {239, 268, 297, 299, 328, 357, 386, 415, 444, 473, 502, 531, 560, 589, 618, 647, 649, 678, 707, 7, 36, 65, 94, 123, 152, 181, 210},
            {267, 296, 298, 327, 356, 385, 414, 443, 472, 501, 530, 559, 588, 617, 646, 675, 677, 706, 6, 35, 64, 93, 122, 151, 180, 209, 238},
            {295, 324, 326, 355, 384, 413, 442, 471, 500, 529, 558, 587, 616, 645, 674, 676, 705, 5, 34, 63, 92, 121, 150, 179, 208, 237, 266},
            {323, 325, 354, 383, 412, 441, 470, 499, 528, 557, 586, 615, 644, 673, 702, 704, 4, 33, 62, 91, 120, 149, 178, 207, 236, 265, 294},
            {351, 353, 382, 411, 440, 469, 498, 527, 556, 585, 614, 643, 672, 701, 703, 3, 32, 61, 90, 119, 148, 177, 206, 235, 264, 293, 322},
            {352, 381, 410, 439, 468, 497, 526, 555, 584, 613, 642, 671, 700, 729, 2, 31, 60, 89, 118, 147, 176, 205, 234, 263, 292, 321, 350}};
        int** bandha = new int*[27];
        for (int i = 0; i < 27; i++)
        {
            bandha[i] = new int[27];
            for (int j = 0; j < 27; j++)
            {
                bandha[i][j] = temp_chakra_bandha[i][j];
            }
        }
        Bandha bandha27(27, bandha);
        return bandha27.apply(chakra);
    }
};

class Navmank_Bandha 
{
public:
    static int* apply (Chakra27 chakra, vector<int> order)
    {
        int temp_chakra_bandha[9][9] = {
            {47, 58, 69, 80, 1, 12, 23, 34, 45},
            {57, 68, 79, 9, 11, 22, 33, 44, 46},
            {67, 78, 8, 10, 21, 32, 43, 54, 56},
            {77, 7, 18, 20, 31, 42, 53, 55, 66},
            {6, 17, 19, 30, 41, 52, 63, 65, 76},
            {16, 27, 29, 40, 51, 62, 64, 75, 5},
            {26, 28, 39, 50, 61, 72, 74, 4, 15},
            {36, 38, 49, 60, 71, 73, 3, 14, 25},
            {37, 48, 59, 70, 81, 2, 13, 24, 35}};
        int **navmank_bandha = new int *[9];
        for (int i = 0; i < 9; i++)
        {
            navmank_bandha[i] = new int[9];
            for (int j = 0; j < 9; j++)
            {
                navmank_bandha[i][j] = temp_chakra_bandha[i][j];
            }
        }
        int *sequenced = new int[27 * 27];
        Bandha bandha9(9, navmank_bandha);
        for (int sub_chakraN = 0; sub_chakraN < 9; sub_chakraN++)
        {
            bandha9.apply_insert(chakra.get_sub_chakra(sub_chakraN), sequenced, order[sub_chakraN]);
        }
        return sequenced;
    }


};
