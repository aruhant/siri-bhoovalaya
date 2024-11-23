#include <iostream>
#include <vector>
#include <cassert>
using namespace std;

int** generate_generic_chakra_bandha(const int n) {
    // add this on free store int toPrint[n][n];
    int** chakra_bandha = new int*[n];
    for (int i = 0; i < n; i++) {
        chakra_bandha[i] = new int[n];
    }
    // a boolean array to keep track of the visited cells
    bool visited[n][n];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            visited[i][j] = false;
        }
    }
    int i = 0;
    int j = (n-1)/2;
    int count = 1;
    // we will start from the middle of the first row and move diagonally up
    while (true){
        visited[i][j] = true;
        chakra_bandha[i][j] = count;
        if (i == n - 1 && j == (n-1)/2) {
            break;
        }
        i = (((i - 1) % n) + n) % n;
       j = (((j + 1) % n) + n) % n;
        if (visited[i][j]) {
            i = (((i + 2) % n) + n) % n;
            j = (((j - 1) % n) + n) % n;
        }
        count++;
    }
    return chakra_bandha;
}

const int n = 3;
int* generic_bandha(int chakra[n][n], int** bandha) {
    int* transposed = new int[n*n];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            assert(i>=0 && i<n && j>=0 && j<n);
            transposed[bandha[i][j]-1] = chakra[i][j];
        }
    }
    return transposed;
}


int main() {
    // a two dimenstion square array with numbers between 1 and 64
    int chakra[n][n] = {
    { 1,  12,  13},
    { 60,  5,  26},
    { 7,  18,  39}
};
    int** my_chakra_bandha= generate_generic_chakra_bandha(3);
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            cout << my_chakra_bandha[i][j] << " ";
        }
        cout << endl;
    }

    int* transposed = generic_bandha(chakra, my_chakra_bandha);
    for (int i = 0; i < 9; i++) {
        cout << transposed[i] << " ";
    }
    cout << endl;
    delete[] transposed;
    for (int i = 0; i < 3; i++) {
        delete[] my_chakra_bandha[i];
    }
    return 0;
}