# Gaussian Elimination and Applications

> **VNU-HCMUS — Applied Mathematics and Statistics Project**

This repository implements **Gaussian Elimination** and several of its applications in linear algebra using Python.  
The project focuses on implementing the core algorithms manually instead of relying on high-level numerical linear algebra functions.

## Overview

Gaussian elimination is a fundamental method for transforming matrices into simpler forms using elementary row operations. From the same underlying idea, this project implements several common linear algebra operations:

- Solving systems of linear equations
- Back substitution
- Computing determinants
- Finding matrix inverses
- Computing matrix rank
- Finding bases for the row space
- Finding bases for the column space
- Finding bases for the null space

Partial pivoting and small numerical tolerances are used where appropriate to improve numerical stability.

## Project Structure

```text
MTH00051-_Gaussian-and-Application/
│
├── gaussian.py          # Gaussian elimination and back substitution
├── determinant.py       # Determinant using Gaussian elimination
├── inverse.py           # Matrix inverse using Gauss-Jordan elimination
├── rank_and_basic.py    # Rank, row-space, column-space and null-space bases
├── part1_demo.ipynb     # Demonstration and test suite
└── README.md
```

## Implemented Methods

### 1. Gaussian Elimination

Implemented in `gaussian.py`.

```python
gaussian_eliminate(A, b)
```

The function transforms the augmented matrix `[A | b]` into upper-triangular form using Gaussian elimination with partial pivoting.

It returns:

```python
U, x, swaps
```

where:

- `U` is the upper-triangular matrix
- `x` is the solution vector
- `swaps` is the number of row swaps performed during elimination

The solution is obtained using back substitution.

### 2. Back Substitution

Also implemented in `gaussian.py`.

```python
back_substitution(U, c)
```

Given an upper-triangular system

```text
Ux = c
```

the function computes the solution vector `x` from the last equation upward.

### 3. Determinant

Implemented in `determinant.py`.

```python
determinant(A)
```

The matrix is transformed into upper-triangular form. The determinant is then obtained from the product of diagonal elements, while accounting for row swaps:

```text
det(A) = (-1)^s × u11 × u22 × ... × unn
```

where `s` is the number of row swaps.

If a valid pivot cannot be found, the matrix is treated as singular and the determinant is returned as `0.0`.

### 4. Matrix Inverse

Implemented in `inverse.py`.

```python
inverse(A)
```

The function uses **Gauss-Jordan elimination** on the augmented matrix

```text
[A | I]
```

and transforms it into

```text
[I | A⁻¹]
```

If the matrix is singular, the function returns:

```python
None
```

### 5. Rank and Fundamental Subspaces

Implemented in `rank_and_basic.py`.

```python
rank_and_basis(A)
```

The matrix is reduced to **Reduced Row Echelon Form (RREF)** and the pivot columns are identified.

The function returns:

```python
rank, row_basis, col_basis, null_basis
```

where:

- `rank` — rank of the matrix
- `row_basis` — basis for the row space
- `col_basis` — basis for the column space
- `null_basis` — basis for the null space

The column-space basis is selected from the **original matrix** using the pivot-column indices found during row reduction.

## Example

### Solving a Linear System

```python
from gaussian import gaussian_eliminate

A = [
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2]
]

b = [8, -11, -3]

U, x, swaps = gaussian_eliminate(A, b)

print("Upper triangular matrix:")
for row in U:
    print(row)

print("Solution:", x)
print("Row swaps:", swaps)
```

Expected solution:

```text
x = [2, 3, -1]
```

### Determinant

```python
from determinant import determinant

A = [
    [1, 2],
    [3, 4]
]

print(determinant(A))
```

### Matrix Inverse

```python
from inverse import inverse

A = [
    [4, 7],
    [2, 6]
]

A_inv = inverse(A)

for row in A_inv:
    print(row)
```

### Rank and Bases

```python
from rank_and_basic import rank_and_basis

A = [
    [1, 2, 3],
    [2, 4, 6],
    [1, 1, 1]
]

rank, row_basis, col_basis, null_basis = rank_and_basis(A)

print("Rank:", rank)
print("Row-space basis:", row_basis)
print("Column-space basis:", col_basis)
print("Null-space basis:", null_basis)
```

## Demo Video

Watch the project demonstration on YouTube:

[![Gaussian Elimination and Applications Demo](https://img.youtube.com/vi/IhjJjjMSerc/maxresdefault.jpg)](https://youtu.be/IhjJjjMSerc)

> Click the thumbnail above to watch the demo video.

## Testing

`part1_demo.ipynb` contains the project's test suite and demonstrations.

The notebook tests:

- Back substitution
- Gaussian elimination
- Determinant calculation
- Matrix inversion
- Rank and basis calculation
- Singular matrices
- Near-zero pivots
- Floating-point inputs
- Random matrices
- Numerical stress cases

The custom implementations are also checked against **NumPy** results when appropriate.

Current recorded notebook results include:

| Component | Tests |
|---|---:|
| Back Substitution | 7 / 7 passed |
| Gaussian Elimination | 9 / 9 passed |
| Determinant | 8 / 8 passed |
| Matrix Inverse | 7 / 7 passed |
| Rank and Basis | 8 / 8 passed |

## Requirements

The main algorithm files are implemented using standard Python data structures.

To run the demonstration notebook, install:

```bash
pip install numpy jupyter
```

Recommended Python version:

```text
Python 3.10+
```

## Running the Project

Clone the repository:

```bash
git clone https://github.com/XuanDuong1905/MTH00051-_Gaussian-and-Application.git
cd MTH00051-_Gaussian-and-Application
```

Start Jupyter Notebook:

```bash
jupyter notebook
```

Then open:

```text
part1_demo.ipynb
```

You can also import the functions directly into another Python script:

```python
from gaussian import gaussian_eliminate, back_substitution
from determinant import determinant
from inverse import inverse
from rank_and_basic import rank_and_basis
```

## Numerical Notes

Floating-point computations cannot reliably compare values with exact zero.  
For that reason, the implementations use small `EPS` thresholds to determine when a number should be treated as zero.

The Gaussian-related routines also use **partial pivoting**, selecting a row with a large absolute pivot value before elimination. This reduces problems caused by dividing by very small numbers.

This implementation is intended primarily for **educational purposes** and demonstrating the algorithms behind common linear algebra operations. For large-scale numerical computing, optimized libraries such as NumPy or SciPy are generally more appropriate.

## Course Information

**University:** University of Science, VNU-HCM  
**Course:** Applied Mathematics and Statistics  
**Topic:** Gaussian Elimination and Applications

## Author

**XuanDuong1905**

GitHub: https://github.com/XuanDuong1905

---

If you find this project useful for studying Gaussian elimination and basic linear algebra algorithms, feel free to explore the implementation and test cases.
