### PAGINATION

http://localhost:5100/users?page=1&limit=10&sortedBy=-name&age[gte]=5, тут ми задаємо page = 1 limit = 10 це просто 
значення, як і sortedBy але тут ми передаємо назву ключа по якому буде сортуватися наш респонс, а знак мінус перед 
name означає що сортування буде задом на перед age[gte]=5 тут ми передамо age: {gte: 5} тобто так щоб коли приймемо 
змогли віддати юзерів старших 5

user.router.ts
````
router.get("/", userController.findAllWithPagination);
````
user.controller.ts
````
public async findAllWithPagination(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IPaginationResponse<IUser>>> {
    try {
      const users = await userService.findAllWithPagination(
        req.query as unknown as IQuery
      );

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
````
user.service.ts
````
public async findAllWithPagination(
    query: IQuery
  ): Promise<IPaginationResponse<any>> {
    try {
    // ці всі махінації щоб поставити знак $ перед gte|lte|gt|lt, щоб потім при пошуку видати значення потрібні
      const queryStr = JSON.stringify(query);
      const queryObj = JSON.parse(
        queryStr.replace(/\b(gte|lte|gt|lt)\b/, (match) => `$${match}`)
      );
      // page = 1 це означає що якщо нам не передали даних до по дефолту буде 1, ...searchObject rest оператор що
      // забере до себе всі дані що залишилися
      const {
        page = 1,
        limit = 10,
        sortedBy = "createdAt",
        ...searchObject
      } = queryObj;

      // формула щоб вирахувати скільки потрібно пропустити
      const skip = +limit * (+page - 1);

      // limit скільки елементів ми візьмемо, skip - скільки пропустимо від першого елементу, sort по якому ключу
      // сортувати
      const [users, usersTotalCount, usersSearchCount] = await Promise.all([
        User.find(searchObject).limit(+limit).skip(skip).sort(sortedBy),
        User.count(),
        User.count(searchObject),
      ]);

      return {
        page: +page,
        perPage: +limit,
        itemsCount: usersTotalCount,
        itemsFound: usersSearchCount,
        data: users,
      };
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
````
query.types.ts
````
export interface IQuery {
  page: string;
  limit: string;
  sortedBy: string;

  [key: string]: string;
}
export interface IPaginationResponse<T> {
  page: number;
  perPage: number;
  itemsCount: number;
  itemsFound: number;
  data: T[];
}
````