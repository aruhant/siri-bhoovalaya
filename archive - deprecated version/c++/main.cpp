#include "substitution_table.cpp"
#include <iostream>
using namespace std;

int main()
{
    SubstitutionTable st("IPA");
    string *substitutionTable = st.getSubstitutionTable();
    st.print();
    cout << endl;
    cout << st.getLanguage() << endl;
    cout << st[0] << endl;
    return 0;
}