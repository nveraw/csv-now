export default function CsvTable() {
  return (
    <table>
      <thead>
        <th>postId</th>
        <th>id</th>
        <th>name</th>
        <th>email</th>
        <th>body</th>
      </thead>
      <tbody>
        <tr>
          <td rowSpan={3}>1</td>
          <td>1</td>
          <td>name1</td>
          <td>email1@mail.com</td>
          <td>post 1</td>
        </tr>
        <tr>
          <td>2</td>
          <td>name2</td>
          <td>email2@mail.com</td>
          <td>post 2</td>
        </tr>
        <tr>
          <td>3</td>
          <td>name3</td>
          <td>email3@mail.com</td>
          <td>post 3</td>
        </tr>
        <tr>
          <td>2</td>
          <td>4</td>
          <td>name4</td>
          <td>email4@mail.com</td>
          <td>post 4</td>
        </tr>
      </tbody>
    </table>
  );
}
