/*
 * PEG.js grammar for the PED format
 *
 * http://pegjs.org
 * http://pngu.mgh.harvard.edu/~purcell/plink/data.shtml#ped
 *
 * 2015, Martijn Vermaat <martijn@vermaat.name>
 */

lines = (newline* line:line newline+ { return line })*

line = comment / member

comment =
  "#" spacing? chars:nonnewline*
  { return ["comment", chars.join("")] }

member =
  family:name spacing
  member:name spacing
  father:(name / missing) spacing
  mother:(name / missing) spacing
  gender:gender spacing
  phenotype:phenotype
  genotypes:(genotype / missinggenotype)*
  { return ["member", {
      "family": family,
      "member": member,
      "father": father,
      "mother": mother,
      "gender": gender,
      "phenotype": phenotype,
      "genotypes": genotypes}]}

gender = "1" { return 1 }
       / "2" { return 2 }
       / nonwhitespace { return 0 }

genotype =
  spacing !missing a:nonwhitespace spacing !missing b:nonwhitespace
  { return [a, b] }

missinggenotype =
  spacing missing whitespace missing
  { return undefined }

phenotype = chars:nonwhitespace+ { return chars.join("") }
name = !missing chars:namechar+ { return chars.join("") }
missing = [0.] { return undefined }

nonwhitespace = !whitespace char:. { return char }
nonnewline = !newline char:. { return char }

namechar = [a-zA-Z0-9_-]
whitespace = (spacing / newline)+
spacing = [ \t]+
newline = "\r"? "\n"

