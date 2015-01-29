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
  father:name spacing
  mother:name spacing
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
  spacing !"0" a:nonwhitespace spacing !"0" b:nonwhitespace
  { return [a, b] }

missinggenotype =
  spacing "0" whitespace "0"
  { return undefined }

phenotype = chars:nonwhitespace+ { return chars.join("") }
name = chars:alphanum+ { return chars.join("") }

nonwhitespace = !whitespace char:. { return char }
nonnewline = !newline char:. { return char }

alphanum = [a-zA-Z0-9]
whitespace = (spacing / newline)+
spacing = [ \t]+
newline = "\r"? "\n"

