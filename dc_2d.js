/* 
Finding and Solving Quadratic Error Formula using gradients and positions.
*/
function qef(positions, gradients)
{
      
    // calculating QEF
    var formula = [];
    for(let i = 0; i < positions.length; i++)
    {
        formula.push([-1*gradients[i][0], -1*gradients[i][1], gradients[i][0]*positions[i][0]+gradients[i][1]*positions[i][1]]);
    }

    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;
    let e = 0;
    let f = 0;
    for(let i = 0; i < formula.length; i++)
    {
        a += formula[i][0]*formula[i][0];
        b += 2*formula[i][0]*formula[i][1];
        c += 2*formula[i][0]*formula[i][2];
        d += formula[i][1]*formula[i][1];
        e += 2*formula[i][1]*formula[i][2];
        f += formula[i][2]*formula[i][2];
    }

    // Solving QEF
    var rx, ry;
    if(a != 0 && d != 0 && 4*d*a - b*b != 0)
    {
        rx = (b*e - 2*d*c)/(4*a*d-b*b);
        ry = (b*c - 2*a*e)/(4*a*d-b*b);
    }
    else
    {
        rx = undefined;
        ry = undefined;
    }

    return [rx, ry];
}

/* 
returns the function gradient for a specific position
*/
function gradient(f, c, d=0.01)
{
    return [(f(c[0]+d, c[1])-f(c[0]-d, c[1]))/(2*d), (f(c[0], c[1]+d)-f(c[0], c[1]-d))/(2*d)];
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
function find_index(x, y, xmin, ymin, xmax)
{
    return (y-ymin)*(xmax-xmin+1)+(x-xmin);
}

/*
For Dual Contouring, choosing the best placement for a vertex for function f
in the cell (x, y) (x+1, y) (x+1, y+1) (x, y+1).
*/
function choose_vertex_location(f, x, y, positions, bias=0.01)
{
    // Calculate gradients
    var gradients = [];
    let avgx = 0;
    let avgy = 0;
    for(let i = 0; i < positions.length; i++)
    {
        avgx += positions[i][0];
        avgy += positions[i][1];
        gradients.push(gradient(f, positions[i]));
    }
    avgx = avgx/positions.length;
    avgy = avgy/positions.length;

    // Putting a bias toward the cell
    positions.push([avgx, avgy]);
    gradients.push([bias, 0]);
    positions.push([avgx, avgy]);
    gradients.push([0, bias]);

    // Checking if the point is in the cell
    // If no putting it to the cell
    var r = qef(positions, gradients);
    if(r[0] == undefined || r[1] == undefined)
    {
        r = [avgx, avgy];
    }
    else if(r[0]<(x) || r[0]>(x+1) || r[1]<(y) || r[1]>(y+1))
    {
        r = [avgx, avgy];
    }

    return r;
}

/*
Finding vertices and edges of our mesh usin dual contouring algorithme
*/
export function dual_contouring(f, xmin = -10, ymin = -10, xmax = 10, ymax = 10)
{
    // Calculate the vertices
    var vertices = [];
    var vertices_dic = {};
    var edges = [];
    var faces = [];
    var counter =0;
    for(let x = xmin; x<xmax; x++)
    {
        for(let y = ymin; y<ymax; y++)
        {
            let xy = f(x, y);
            let xy1 = f(x, y+1);
            let x1y1 = f(x+1, y+1);
            let x1y = f(x+1, y);

            // Finding side changing edges
            let positions = [];
            if ((xy <= 0 && xy1 > 0) || (xy > 0 && xy1 <= 0))
            {
                let k = estimate_intersection(xy, xy1);
                positions.push([x, y+k]);
            }
            if ((xy1 <= 0 && x1y1 > 0) || (xy1 > 0 && x1y1 <= 0))
            {
                let k = estimate_intersection(xy1, x1y1);
                positions.push([x+k, y+1]);
            }
            if ((x1y1 <= 0 && x1y > 0) || (x1y1 > 0 && x1y <= 0))
            {
                let k = estimate_intersection(x1y, x1y1);
                positions.push([x+1, y+k]);
            }
            if ((x1y <= 0 && xy > 0) || (x1y > 0 && xy <= 0))
            {
                let k = estimate_intersection(xy, x1y);
                positions.push([x+k, y]);
            }

            // Finding vertices
            if (positions.length > 0)
            {
                let index = find_index(x, y, xmin, ymin, xmax);
                vertices.push(choose_vertex_location(f, x, y, positions));
                vertices_dic[index] = counter;
                counter++;
            }
            if (xy <= 0 && xy1 <= 0 && x1y1 <= 0 && x1y <= 0)
            {
                let index = find_index(x, y, xmin, ymin, xmax);
                vertices.push([x+0.5, y+0.5]);
                vertices_dic[index] = counter;
                counter++;
            }
        }  
    }

    // Find the faces
    for(let x = xmin+1; x<xmax; x++)
    {
        for(let y = ymin+1; y<ymax; y++)
        {
            if(f(x, y) <= 0)
            {
                let i_x1y1 = find_index(x-1, y-1, xmin, ymin, xmax);
                let i_xy1 = find_index(x, y-1, xmin, ymin, xmax);
                let i_xy = find_index(x, y, xmin, ymin, xmax);
                let i_x1y = find_index(x-1, y, xmin, ymin, xmax);
                faces.push([vertices_dic[i_x1y1], vertices_dic[i_xy1], vertices_dic[i_xy], vertices_dic[i_x1y]]);
            }
        }
    }
    return [vertices, faces];
}

function f(x, y)
{
    return x*x + y*y - 3;
}

let r = dual_contouring(f, -2, -2, 2, 2);