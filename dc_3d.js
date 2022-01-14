/* 
Finding and Solving Quadratic Error Formula using gradients and positions.
*/
function qef(positions, gradients)
{     
    // calculating QEF
    var formula = [];
    for(let i = 0; i < positions.length; i++)
    {
        formula.push([-1*gradients[i][0], -1*gradients[i][1], -1*gradients[i][2], gradients[i][0]*positions[i][0]+gradients[i][1]*positions[i][1]+gradients[i][2]*positions[i][2]]);
    }

    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;
    let e = 0;
    let f = 0;
    let g = 0;
    let h = 0;
    let k = 0;
    let j = 0;

    for(let i = 0; i < formula.length; i++)
    {
        a += formula[i][0]*formula[i][0];
        b += 2*formula[i][0]*formula[i][1];
        c += 2*formula[i][0]*formula[i][2];
        d += 2*formula[i][0]*formula[i][3];
        e += formula[i][1]*formula[i][1];
        f += 2*formula[i][1]*formula[i][2];
        g += 2*formula[i][1]*formula[i][3];
        h += formula[i][2]*formula[i][2];
        k += 2*formula[i][2]*formula[i][3];
        j += formula[i][3]*formula[i][3];
    }

    // Solving QEF
    var rx, ry, rz;
    if(a != 0 && e != 0 && h != 0 && -8*a*e*h + 2*a*f*f + 2*b*b*h - 2*b*c*f + 2*c*c*e != 0)
    {
        rx = (b*f*k - 2*b*g*h - 2*c*e*k + c*f*g + 4*d*e*h - d*f*f)/(-8*a*e*h + 2*a*f*f + 2*b*b*h - 2*b*c*f + 2*c*c*e);
        ry = (-2*a*f*k + 4*a*g*h + b*c*k - 2*b*d*h - g*c*c + c*d*f)/(-8*a*e*h + 2*a*f*f + 2*b*b*h - 2*b*c*f + 2*c*c*e);
        rz = (4*a*e*k - 2*a*f*g - k*b*b + b*c*g + b*d*f - 2*c*d*e)/(-8*a*e*h + 2*a*f*f + 2*b*b*h - 2*b*c*f + 2*c*c*e);
    }
    else
    {
        rx = undefined;
        ry = undefined;
        rz = undefined;
    }

    return [rx, ry, rz];
}

/* 
returns the function gradient for a specific position
*/
function gradient(f, c, d=0.01)
{
    return [(f(c[0]+d, c[1], c[2])-f(c[0]-d, c[1], c[2]))/(2*d), (f(c[0], c[1]+d, c[2])-f(c[0], c[1]-d, c[2]))/(2*d), (f(c[0], c[1], c[2]+d)-f(c[0], c[1], c[2]-d))/(2*d)];
}

/*
Estimates intersection point of boundary and edge
Can be improved by using gradients (maybe)
*/
function estimate_intersection(p1, p2)
{
    return p1/(p1-p2);
}

/*
Finds index from coordinates on a 2D square grid
*/
function find_index(x, y, z, xmin, ymin, zmin, xmax, ymax)
{
    return (z-zmin)*((xmax-xmin+1)*(ymax-ymin+1))+(y-ymin)*(xmax-xmin+1)+(x-xmin);
}

/*
For Dual Contouring, choosing the best placement for a vertex for function f
in the cell (x, y, z) (x+1, y, z) (x+1, y+1, z) (x, y+1, z) (x, y, z+1)
(x+1, y, z+1) (x+1, y+1, z+1) (x, y+1, z+1).
*/
function choose_vertex_location(f, x, y, z, positions, derivable=true, bias=0.01)
{
    // Calculate gradients
    var gradients = [];
    let avgx = 0;
    let avgy = 0;
    let avgz = 0;
    for(let i = 0; i < positions.length; i++)
    {
        avgx += positions[i][0];
        avgy += positions[i][1];
        avgz += positions[i][2];
        gradients.push(gradient(f, positions[i]));
    }
    avgx = avgx/positions.length;
    avgy = avgy/positions.length;
    avgz = avgz/positions.length;

    // Putting a bias toward the cell
    positions.push([avgx, avgy, avgz]);
    gradients.push([bias, 0, 0]);
    positions.push([avgx, avgy, avgz]);
    gradients.push([0, bias, 0]);
    positions.push([avgx, avgy, avgz]);
    gradients.push([0, 0, bias]);

    
    // Calculating optimal position for the vertex
    var r = [avgx, avgy, avgz];
    if(derivable)
    {
        r = qef(positions, gradients);
    }

    // Checking if the point is in the cell
    // If no putting it to the cell
    if(r[0] == undefined || r[1] == undefined || r[2] == undefined)
    {
        r = [avgx, avgy, avgz];
    }
    else if(r[0]<(x) || r[0]>(x+1) || r[1]<(y) || r[1]>(y+1) || r[2]<(z) || r[2]>(z+1))
    {
        r = [avgx, avgy, avgz];
    }

    return r;
}

/*
Finding vertices and edges of our mesh usin dual contouring algorithme
*/
export function dual_contouring(f, xmin = -10, ymin = -10, zmin = -10, xmax = 10, ymax = 10, zmax = 10, derivable = true, bias=0.01)
{
    // Calculate the vertices
    var vertices = [];
    var vertices_dic = {};
    var volumes = [];
    var counter =0;
    for(let x = xmin; x<xmax; x++)
    {
        for(let y = ymin; y<ymax; y++)
        {
            for(let z = zmin; z < zmax; z++)
            {
                let xyz = f(x, y, z);
                let xy1z = f(x, y+1, z);
                let x1y1z = f(x+1, y+1, z);
                let x1yz = f(x+1, y, z);
                let xyz1 = f(x, y, z+1);
                let xy1z1 = f(x, y+1, z+1);
                let x1y1z1 = f(x+1, y+1, z+1);
                let x1yz1 = f(x+1, y, z+1);

                // Finding side changing edges
                let positions = [];
                if ((xyz < 0 && xy1z >= 0) || (xyz >= 0 && xy1z < 0))
                {
                    let k = estimate_intersection(xyz, xy1z);
                    positions.push([x, y+k, z]);
                }
                if ((xy1z < 0 && x1y1z >= 0) || (xy1z >= 0 && x1y1z < 0))
                {
                    let k = estimate_intersection(xy1z, x1y1z);
                    positions.push([x+k, y+1, z]);
                }
                if ((x1y1z < 0 && x1yz >= 0) || (x1y1z >= 0 && x1yz < 0))
                {
                    let k = estimate_intersection(x1yz, x1y1z);
                    positions.push([x+1, y+k, z]);
                }
                if ((x1yz < 0 && xyz >= 0) || (x1yz >= 0 && xyz < 0))
                {
                    let k = estimate_intersection(xyz, x1yz);
                    positions.push([x+k, y, z]);
                }

                if ((xyz1 < 0 && xy1z1 >= 0) || (xyz1 >= 0 && xy1z1 < 0))
                {
                    let k = estimate_intersection(xyz1, xy1z1);
                    positions.push([x, y+k, z+1]);
                }
                if ((xy1z1 < 0 && x1y1z1 >= 0) || (xy1z1 >= 0 && x1y1z1 < 0))
                {
                    let k = estimate_intersection(xy1z1, x1y1z1);
                    positions.push([x+k, y+1, z+1]);
                }
                if ((x1y1z1 < 0 && x1yz1 >= 0) || (x1y1z1 >= 0 && x1yz1 < 0))
                {
                    let k = estimate_intersection(x1yz1, x1y1z1);
                    positions.push([x+1, y+k, z+1]);
                }
                if ((x1yz1 < 0 && xyz1 >= 0) || (x1yz1 >= 0 && xyz1 < 0))
                {
                    let k = estimate_intersection(xyz1, x1yz1);
                    positions.push([x+k, y, z+1]);
                }

                if ((xyz < 0 && xyz1 >= 0) || (xyz >= 0 && xyz1 < 0))
                {
                    let k = estimate_intersection(xyz, xyz1);
                    positions.push([x, y, z+k]);
                }
                if ((xy1z < 0 && xy1z1 >= 0) || (xy1z >= 0 && xy1z1 < 0))
                {
                    let k = estimate_intersection(xy1z, xy1z1);
                    positions.push([x, y+1, z+k]);
                }
                if ((x1y1z < 0 && x1y1z1 >= 0) || (x1y1z >= 0 && x1y1z1 < 0))
                {
                    let k = estimate_intersection(x1y1z, x1y1z1);
                    positions.push([x+1, y+1, z+k]);
                }
                if ((x1yz < 0 && x1yz1 >= 0) || (x1yz >= 0 && x1yz1 < 0))
                {
                    let k = estimate_intersection(x1yz, x1yz1);
                    positions.push([x+1, y, z+k]);
                }

                // Finding vertices
                if (positions.length > 0)
                {
                    let index = find_index(x, y, z, xmin, ymin, zmin, xmax, ymax);
                    vertices.push(choose_vertex_location(f, x, y, z, positions, derivable, bias));
                    vertices_dic[index] = counter;
                    counter++;
                }
                if (xyz < 0 && xy1z < 0 && x1y1z < 0 && x1yz < 0 && xyz1 < 0 && xy1z1 < 0 && x1y1z1 < 0 && x1yz1 < 0)
                {
                    let index = find_index(x, y, z, xmin, ymin, zmin, xmax, ymax);
                    vertices.push([x+0.5, y+0.5, z+0.5]);
                    vertices_dic[index] = counter;
                    counter++;
                }   
            }
        }
    }

    for(let x = xmin+1; x<xmax; x++)
    {
        for(let y = ymin+1; y<ymax; y++)
        {
            for(let z = zmin+1; z < zmax; z++)
            {
                if(f(x, y, z) < 0)
                {
                    let i_x1y1z1 = find_index(x-1, y-1, z-1, xmin, ymin, zmin, xmax, ymax);
                    let i_xy1z1 = find_index(x, y-1, z-1, xmin, ymin, zmin, xmax, ymax);
                    let i_xyz1 = find_index(x, y, z-1, xmin, ymin, zmin, xmax, ymax);
                    let i_x1yz1 = find_index(x-1, y, z-1, xmin, ymin, zmin, xmax, ymax);
                    let i_x1y1z = find_index(x-1, y-1, z, xmin, ymin, zmin, xmax, ymax);
                    let i_xy1z = find_index(x, y-1, z, xmin, ymin, zmin, xmax, ymax);
                    let i_xyz = find_index(x, y, z, xmin, ymin, zmin, xmax, ymax);
                    let i_x1yz = find_index(x-1, y, z, xmin, ymin, zmin, xmax, ymax);
                    volumes.push([vertices_dic[i_x1y1z1], vertices_dic[i_xy1z1], vertices_dic[i_xyz1], vertices_dic[i_x1yz1], vertices_dic[i_x1y1z], vertices_dic[i_xy1z], vertices_dic[i_xyz], vertices_dic[i_x1yz]]);
                }
            }
        }
    }

    return [vertices, volumes];
}
/*
function f(x, y, z)
{
    return x*x + y*y + z*z - 3;
}

let r = dual_contouring(f, -2, -2, -2, 2, 2, 2);
*/

/*
Explique il serve quoi le maillage hexaedrique
Methode du dual contouring
Comparaison avec marching cubes
Comment j'ai avancer +
Image de resultats +
Des choses encore a faire
Des optimisations -> regarder des optimisations de marching cubes
pq j'ai pas fait des comparaisons avec des autres
Parler des bibliotheque utilisée
*/

/*
trouver des arrets en 2D
*/

/* 
A ajouter: 
Explications a tous les photos
*/
