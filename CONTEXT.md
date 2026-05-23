# Co-Curricular Management Context

Glossary of domain terms for the co-curricular management system.

## Language

**Pillar**:
The top-level grouping of co-curricular activities (Uniform, Club, or Sport).
_Avoid_: Category, Kategori
_Database note_: The database column is named `kategori` on the `kokurikulum_units` table. Do not rename this column. In all React components and domain conversations, use the term "Pillar".

**Unit**:
The specific co-curricular activity a student belongs to within a Pillar (e.g., Pengakap, Bola Sepak).
_Avoid_: Group, Activity

**Unit Advisor**:
A teacher assigned to manage the participation data for all students within a specific **Unit**, regardless of which class the students are in.
_Avoid_: Guru Penasihat

**Access Request**:
A pending record submitted by a teacher to gain access to the portal, optionally claiming an existing teacher profile.
_Avoid_: Sign-up, registration, profile claim

## Relationships

- A **Pillar** contains many **Units**.
- A student belongs to exactly one **Unit** per **Pillar**.
- A **Unit Advisor** manages all students assigned to a specific **Unit**.
- An **Access Request** is submitted by a prospective teacher and must be approved by an admin before portal access is granted.

## Example dialogue

> **Dev:** "If a teacher is assigned to manage Pengakap, what are they managing?"
> **Domain expert:** "They are managing a **Unit** within the Uniform **Pillar**."
